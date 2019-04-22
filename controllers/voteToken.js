const _ = require("lodash");
const moment = require("moment");
const crypto = require("crypto");
const bcrypt = require("../modules/bcrypt");
const db = require("../models");
const Socket = require("../services/socket");
const canvas = require("../modules/canvas");

function encapsulateVoteToken(voteToken, user) {
  if (user.role === "SUPER_ADMIN") return voteToken;
  else
    return {
      ...voteToken.toObject()
    };
}

async function newCaptcha(ip) {
  return new db.Captcha({
    ip,
    value: (await crypto.randomBytes(2))
      .toString("hex")
      .toUpperCase()
      .replace(/0/g, "Y")
      .replace(/O/g, "Z"),
    remainingTry: 3,
    validUntil: moment()
      .add(10, "minutes")
      .valueOf()
  });
}

async function renewCaptcha(captcha) {
  captcha.value = (await crypto.randomBytes(2))
    .toString("hex")
    .toUpperCase()
    .replace(/0/g, "Y")
    .replace(/O/g, "Z");
  captcha.remainingTry = 3;
  captcha.validUntil = moment()
    .add(10, "minutes")
    .valueOf();
  return captcha;
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
      const value = (await crypto.randomBytes(3))
        .toString("hex")
        .toUpperCase()
        .replace(/0/g, "Y")
        .replace(/O/g, "Z");
      const voteToken = new db.VoteToken({
        valueHash: await bcrypt.hash(value)
      });
      await voteToken.save();
      voteTokens.push({ value });
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

exports.getVoteTokenCaptchaImageByIp = async (req, res) => {
  const { ip } = req;
  try {
    let captcha = await db.Captcha.findOne({
      ip
    });
    if (!captcha) {
      captcha = await newCaptcha(ip);
      await captcha.save();
    } else if (
      captcha.remainingTry === 0 ||
      captcha.validUntil < moment().valueOf()
    ) {
      captcha = await renewCaptcha(captcha);
      await captcha.save();
    }
    canvas.generateCaptchaImagePngStream(captcha).pipe(res);
  } catch (error) {
    console.log({ error });
    res.status(500).json({ error: { msg: "Please try again!" } });
  }
};

exports.updateVoteTokenByValue = async (req, res) => {
  const { tokenValue, candidateId, captchaValue } = req.body;
  const { ip } = req;

  let candidateSession = null,
    captchaSession = null;
  try {
    candidateSession = await db.Candidate.startSession();
    candidateSession.startTransaction();
    captchaSession = await db.Captcha.startSession();
    captchaSession.startTransaction();

    const voteToken = await db.VoteToken.findOne({
      valueHash: await bcrypt.hash(tokenValue.toUpperCase())
    });
    if (!voteToken) {
      return res
        .status(422)
        .json({ error: { msg: "Vote Token / Captcha is wrong!" } });
    } else if (voteToken.candidateId) {
      return res
        .status(422)
        .json({ error: { msg: "Vote Token has been used!" } });
    }

    const captcha = await db.Captcha.findOne({ ip });
    if (!captcha) {
      captcha = await newCaptcha(ip);
      await captcha.save();
      return res
        .status(422)
        .json({ error: { msg: "Vote Token / Captcha is wrong!", expired } });
    } else if (captcha.validUntil < moment().valueOf()) {
      captcha = await renewCaptcha(captcha);
      await captcha.save();
      return res
        .status(422)
        .json({ error: { msg: "Captcha expired!", expired } });
    } else if (captcha.value !== captchaValue.toUpperCase()) {
      captcha.remainingTry -= 1;
      let expired = false;
      if (captcha.remainingTry === 0) {
        expired = true;
        captcha = await renewCaptcha(captcha);
      }
      await captcha.save();
      return res
        .status(422)
        .json({ error: { msg: "Vote Token / Captcha is wrong!", expired } });
    }
    captcha.validUntil = -1;
    await captcha.save();

    const candidate = await db.Candidate.findById(candidateId);
    if (!candidate) {
      return res
        .status(422)
        .json({ error: { msg: "Candidate doesn't exist!" } });
    }

    voteToken.candidateId = candidateId;
    voteToken.usedAt = moment().toDate();
    await voteToken.save();

    await candidateSession.commitTransaction();
    await captchaSession.commitTransaction();

    res.json({ success: true });
    Socket.globalSocket.emit("VOTE_TOKEN_GET_BY_ID", { id: voteToken._id });
  } catch (error) {
    console.log({ error });
    if (candidateSession) await candidateSession.abortTransaction();
    if (captchaSession) await captchaSession.abortTransaction();
    res.status(500).json({ error: { msg: "Please try again!" } });
  } finally {
    if (candidateSession) candidateSession.endSession();
    if (captchaSession) await captchaSession.abortTransaction();

    db.Captcha.remove({
      validUntil: { $lt: moment().valueOf() }
    })
      .then(() => {})
      .catch(error => console.log({ error }));
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
