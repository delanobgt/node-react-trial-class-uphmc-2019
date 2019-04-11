const _ = require("lodash");
const moment = require("moment");
const crypto = require("crypto");
const db = require("../models");
const Socket = require("../services/socket");
const util = require("util");
const fs = require("fs");
const path = require("path");
const mkdir = util.promisify(fs.mkdir);
const exists = util.promisify(fs.exists);
const unlink = util.promisify(fs.unlink);
const QRCode = require("qrcode");

exports.isVoteTokenAvailableByValue = async (req, res) => {
  const { value } = req.body;
  try {
    const voteToken = await db.VoteToken.findOne({ value });
    if (!voteToken) return res.json(false);
    if (voteToken.candidateId) return res.json(false);
    res.json(true);
  } catch (error) {
    res.json(false);
  }
};

exports.generateQRCodeById = async (req, res) => {
  const { voteTokenId } = req.params;
  try {
    const voteToken = await db.VoteToken.findById(voteTokenId);

    const dir = "QR Codes";
    if (!(await exists(dir))) await mkdir(dir);

    const filename = path.join(dir, `${voteToken.value}.png`);
    await QRCode.toFile(filename, voteToken.value, {
      rendererOpts: { scale: 4 }
    });

    const imagePath = path.join(__dirname, "..", dir, `${voteToken.value}.png`);
    res.sendFile(imagePath);
    res.on("finish", async () => {
      try {
        await unlink(imagePath);
      } catch (error) {
        console.log({ error });
      }
    });
  } catch (error) {
    console.log({ error });
    res.status(500).send("Failed to generate qr code!");
  }
};

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
        value: (await crypto.randomBytes(32)).toString("hex")
      });
      await voteToken.save();
      voteTokens.push(voteToken);
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
      .map(vt => ({ ...vt.toObject(), value: vt.value.slice(0, 10) + "..." }))
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
    const minifiedVoteToken = {
      ...voteToken.toObject(),
      value: voteToken.value.slice(0, 10) + "..."
    };
    res.json(minifiedVoteToken);
  } catch (error) {
    console.log({ error });
    res.status(500).json({ error: { msg: "Please try again!" } });
  }
};

exports.updateVoteTokenByValue = async (req, res) => {
  const { value, candidateId } = req.body;
  try {
    const voteToken = await db.VoteToken.findOne({ value });
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
    res.json(voteToken);
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
  } catch (error) {
    console.log({ error });
    res.status(500).json({ error: { msg: "Please try again!" } });
  }
};
