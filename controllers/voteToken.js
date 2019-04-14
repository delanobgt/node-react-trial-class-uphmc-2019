const _ = require("lodash");
const moment = require("moment");
const crypto = require("crypto");
const db = require("../models");
const Socket = require("../services/socket");

function encapsulateVoteToken(voteToken, user) {
  if (user.role === "SUPER_ADMIN") return voteToken;
  else
    return {
      ...voteToken.toObject(),
      value: voteToken.value.slice(0, 4) + "...."
    };
}

exports.createVoteTokens = async (req, res) => {
  let currentStep = 0;
  const { socketId, voteTokenCount: _voteTokenCount } = req.body;
  const voteTokenCount = Number(_voteTokenCount);

  function emitProgress(msg) {
    currentStep += 1;
    if (!Socket.identifiedSockets[socketId]) return;
    Socket.identifiedSockets[socketId].emit("progress", {
      msg,
      currentStep,
      totalStep: voteTokenCount
    });
  }

  const voteTokens = [];
  for (let i = 0; i < voteTokenCount; i++) {
    try {
      emitProgress();
      const voteToken = new db.VoteToken({
        value: (await crypto.randomBytes(4)).toString("hex")
      });
      await voteToken.save();
      voteTokens.push(encapsulateVoteToken(voteToken, req.user));
      Socket.globalSocket.emit("VOTE_TOKEN_GET_BY_ID", { id: voteToken._id });
    } catch (error) {
      console.log({ error });
    }
  }
  res.json(voteTokens);
};

exports.getVoteTokens = async (req, res) => {
  try {
    const voteTokens = await db.VoteToken.find({});
    const minifiedVoteTokens = _.chain(voteTokens)
      .map(vt => encapsulateVoteToken(vt, req.user))
      .value();
    res.json(minifiedVoteTokens);
  } catch (error) {
    console.log({ error });
    res.status(500).json({ error: { msg: "Please try again!" } });
  }
};

exports.getVoteTokenById = async (req, res) => {
  const { voteTokenId } = req.params;
  try {
    const voteToken = await db.VoteToken.findById(voteTokenId);
    res.json(encapsulateVoteToken(voteToken, req.user));
  } catch (error) {
    console.log({ error });
    res.status(500).json({ error: { msg: "Please try again!" } });
  }
};

exports.updateVoteTokenByValue = async (req, res) => {
  const { value, candidateId } = req.body;
  try {
    const voteToken = await db.VoteToken.findOne({
      value: value.toLowerCase()
    });
    if (!voteToken) {
      return res
        .status(422)
        .json({ error: { msg: "Vote Token doesn't exist!" } });
    } else if (voteToken.candidateId) {
      return res
        .status(422)
        .json({ error: { msg: "Vote Token has been used!" } });
    }

    const candidate = await db.Candidate.findById(candidateId);
    if (!candidate) {
      return res
        .status(422)
        .json({ error: { msg: "Candidate doesn't exist!" } });
    }

    voteToken.candidateId = candidateId;
    voteToken.usedAt = moment().toDate();
    await voteToken.save();
    res.json({ success: true });
    Socket.globalSocket.emit("VOTE_TOKEN_GET_BY_ID", { id: voteToken._id });
  } catch (error) {
    console.log({ error });
    res.status(500).json({ error: { msg: "Please try again!" } });
  }
};

exports.deleteVoteTokenById = async (req, res) => {
  const { voteTokenId } = req.params;
  try {
    const voteToken = await db.VoteToken.findByIdAndRemove(voteTokenId);
    res.json({ id: voteToken._id });
    Socket.globalSocket.emit("VOTE_TOKEN_REMOVE_BY_ID", { id: voteToken._id });
  } catch (error) {
    console.log({ error });
    res.status(500).json({ error: { msg: "Please try again!" } });
  }
};
