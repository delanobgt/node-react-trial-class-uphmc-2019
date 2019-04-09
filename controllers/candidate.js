const _ = require("lodash");
const moment = require("moment");
const cloudinary = require("cloudinary");
const db = require("../models");
const Socket = require("../services/socket");

exports.createCandidate = async (req, res) => {
  if (!req.file)
    return res.status(422).json({ error: { msg: "Require an image!" } });

  const TOTAL_STEP = 3;
  let currentStep = 0;
  const { socketToken } = req.body;

  function emitProgress(msg) {
    if (!Socket.tokenizedSockets[socketToken]) return;
    Socket.tokenizedSockets[socketToken].emit("progress", {
      msg,
      currentStep: ++currentStep,
      totalStep: TOTAL_STEP
    });
  }

  const { orderNumber, fullname, major } = req.body;
  try {
    emitProgress("Saving image..");
    const uploadResult = await cloudinary.v2.uploader.upload(req.file.path, {
      resource_type: "image",
      public_id: `Ambassador Candidate Images/${fullname} (${moment().format(
        "D MMM YYYY (HH:mm:ss)"
      )})`
    });

    emitProgress("Creating candidate..");
    const candidate = new db.Candidate({
      orderNumber,
      fullname,
      major,
      image: {
        secureUrl: uploadResult.secure_url,
        publicId: uploadResult.publicId
      }
    });

    await candidate.save();

    emitProgress("Candidate saved..");
    res.json(candidate);
  } catch (error) {
    console.log({ error });
    res.status(500).json({ error: { msg: "Please try again!" } });
  }
};

exports.getCandidates = async (req, res) => {
  try {
    const candidates = await db.Candidate.find({});
    res.json(candidates);
  } catch (error) {
    console.log({ error });
    res.status(500).json({ error: { msg: "Please try again!" } });
  }
};

exports.getCandidateById = async (req, res) => {
  const { candidateId } = req.params;
  try {
    const candidate = await db.Candidate.findById(candidateId);
    res.json(candidate);
  } catch (error) {
    console.log({ error });
    res.status(500).json({ error: { msg: "Please try again!" } });
  }
};

exports.deleteCandidateById = async (req, res) => {
  const { candidateId } = req.params;
  try {
    const candidate = await db.Employee.findById(candidateId);
    await cloudinary.v2.uploader.destroy(candidate.image.publicId);
    await candidate.remove();
    res.json({ id: candidate._id });
  } catch (error) {
    console.log({ error });
    res.status(500).json({ error: { msg: "Please try again!" } });
  }
};
