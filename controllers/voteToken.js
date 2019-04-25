const _ = require("lodash");
const moment = require("moment");
const crypto = require("crypto");
const db = require("../models");
const Socket = require("../services/socket");
const canvas = require("../modules/canvas");
const { SHA3 } = require("sha3");

function hash(value) {
  const instance = new SHA3(512);
  instance.update(value);
  return instance.digest("hex");
}

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
        valueHash: hash(value)
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

  let voteTokenSession = null,
    captchaSession = null;
  try {
    voteTokenSession = await db.VoteToken.startSession();
    voteTokenSession.startTransaction();
    captchaSession = await db.Captcha.startSession();
    captchaSession.startTransaction();

    const configuration = await db.Configuration.findOne({});
    if (!configuration.onAir) {
      return res.status(422).json({
        error: { msg: "The voting is currently closed!" }
      });
    } else {
      const currentTime = moment().valueOf();
      if (currentTime < moment(configuration.openTimestamp).valueOf()) {
        return res.status(422).json({
          error: { msg: "The voting is still closed!" }
        });
      } else if (currentTime > moment(configuration.closeTimestamp).valueOf()) {
        return res.status(422).json({
          error: { msg: "The voting is already over!" }
        });
      }
    }

    let captcha = await db.Captcha.findOne({ ip });

    if (!captcha) {
      console.log("tidak ada captcha!");
      captcha = await newCaptcha(ip);
      await captcha.save();
      await captchaSession.commitTransaction();
      return res.status(422).json({
        error: { msg: "Captcha is wrong! Please retype.", expired: true }
      });
    } else if (false && captcha.validUntil < moment().valueOf()) {
      console.log("captcha expired!");
      captcha = await renewCaptcha(captcha);
      await captcha.save();
      await captchaSession.commitTransaction();
      return res.status(422).json({
        error: { msg: "Captcha expired, please retry!", expired: true }
      });
    } else if (captcha.value !== captchaValue.toUpperCase()) {
      console.log("captcha mismatch!");
      captcha.remainingTry -= 1;
      let expired = false;
      if (captcha.remainingTry === 0) {
        expired = true;
        captcha = await renewCaptcha(captcha);
      }
      await captcha.save();
      await captchaSession.commitTransaction();
      return res.status(422).json({
        error: { msg: "Captcha is wrong! Please retype.", expired: true }
      });
    }

    const voteToken = await db.VoteToken.findOne({
      valueHash: hash(tokenValue.toUpperCase())
    });
    if (!voteToken) {
      console.log("tidak ada voteToken!");
      captcha.remainingTry -= 1;
      let expired = false;
      if (captcha.remainingTry === 0) {
        expired = true;
        captcha = await renewCaptcha(captcha);
      }
      await captcha.save();
      await captchaSession.commitTransaction();
      return res
        .status(422)
        .json({ error: { msg: "Token doesn't exist!", expired } });
    } else if (voteToken.candidateId) {
      console.log("voteToken sudah dipake!");
      return res.status(422).json({ error: { msg: "Token has been used!" } });
    }

    const candidate = await db.Candidate.findById(candidateId);
    if (!candidate) {
      console.log("tidak ada candidate!");
      captcha.remainingTry -= 1;
      let expired = false;
      if (captcha.remainingTry === 0) {
        expired = true;
        captcha = await renewCaptcha(captcha);
      }
      await captcha.save();
      await captchaSession.commitTransaction();
      return res
        .status(422)
        .json({ error: { msg: "Candidate doesn't exist!", expired } });
    }

    console.log("semua aman");
    captcha.validUntil = -1;
    await captcha.save();
    voteToken.candidateId = candidateId;
    voteToken.usedAt = moment().toDate();
    await voteToken.save();

    await voteTokenSession.commitTransaction();
    await captchaSession.commitTransaction();

    res.json({ success: true });
    Socket.globalSocket.emit("VOTE_TOKEN_GET_BY_ID", { id: voteToken._id });
  } catch (error) {
    console.log({ error });
    if (voteTokenSession) await voteTokenSession.abortTransaction();
    if (captchaSession) await captchaSession.abortTransaction();
    res.status(500).json({ error: { msg: "Please try again!" } });
  } finally {
    if (voteTokenSession) voteTokenSession.endSession();
    if (captchaSession) await captchaSession.endSession();

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
