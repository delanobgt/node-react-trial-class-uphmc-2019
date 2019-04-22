const _ = require("lodash");
const moment = require("moment");
const cloudinary = require("cloudinary");
const sharp = require("sharp");
const db = require("../models");
const path = require("path");
const Socket = require("../services/socket");

async function adjustImage(filePath, { format }) {
  const imageFile = sharp(filePath);

  const { width, height } = await imageFile.metadata();
  // const squareSize = Math.min(width, height, 500);
  const squareSize = 500;

  const fileExt = path.extname(filePath);
  const resultFilePath = path.resolve(
    path.dirname(filePath),
    "adjusted_" + path.basename(filePath, fileExt) + "." + format
  );

  await imageFile
    .resize({
      width: squareSize,
      height: squareSize,
      fit: "cover"
    })
    .toFormat(format)
    .toFile(resultFilePath);

  return resultFilePath;
}

exports.createCandidate = async (req, res) => {
  if (!req.file)
    return res.status(422).json({ error: { msg: "Require an image!" } });

  const TOTAL_STEP = 3;
  let currentStep = 0;
  const { socketId } = req.body;

  function emitProgress(msg) {
    currentStep += 1;
    if (!Socket.identifiedSockets[socketId]) return;
    Socket.identifiedSockets[socketId].emit("progress", {
      msg,
      currentStep,
      totalStep: TOTAL_STEP
    });
  }

  const { orderNumber, fullname, major } = req.body;
  let uploadResult = null;
  let session = null;
  try {
    session = await db.Candidate.startSession();
    session.startTransaction();

    emitProgress("Saving image..");
    const adjustedFilePath = await adjustImage(req.file.path, {
      format: "jpeg"
    });
    uploadResult = await cloudinary.v2.uploader.upload(adjustedFilePath, {
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
        publicId: uploadResult.public_id
      }
    });

    await candidate.save();

    emitProgress("Candidate saved..");
    await session.commitTransaction();
    res.json(candidate);
    Socket.globalSocket.emit("CANDIDATE_GET_BY_ID", { id: candidate._id });
  } catch (error) {
    console.log({ error });
    if (session) await session.abortTransaction();
    if (uploadResult !== null) {
      try {
        await cloudinary.v2.uploader.destroy(uploadResult.public_id);
      } catch (error) {
        console.log({ error });
      }
    }
    res.status(500).json({ error: { msg: "Please try again!" } });
  } finally {
    if (session) session.endSession();
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

exports.updateCandidateById = async (req, res) => {
  const TOTAL_STEP = 3;
  let currentStep = 0;
  const { socketId } = req.body;

  function emitProgress(msg) {
    currentStep += 1;
    if (!Socket.identifiedSockets[socketId]) return;
    Socket.identifiedSockets[socketId].emit("progress", {
      msg,
      currentStep,
      totalStep: TOTAL_STEP
    });
  }

  const { candidateId } = req.params;
  const { orderNumber, fullname, major } = req.body;
  let session = null;
  try {
    session = await db.Candidate.startSession();
    session.startTransaction();

    const candidate = await db.Candidate.findById(candidateId);

    emitProgress("Updating candidate..");
    candidate.orderNumber = orderNumber;
    candidate.fullname = fullname;
    candidate.major = major;
    await candidate.save();

    emitProgress("Saving image..");
    if (req.file) {
      await cloudinary.v2.uploader.destroy(candidate.image.publicId);
      const adjustedFilePath = await adjustImage(req.file.path, {
        format: "jpeg"
      });
      const uploadResult = await cloudinary.v2.uploader.upload(
        adjustedFilePath,
        {
          resource_type: "image",
          public_id: `Ambassador Candidate Images/${fullname} (${moment().format(
            "D MMM YYYY (HH:mm:ss)"
          )})`
        }
      );
      candidate.image = {
        publicId: uploadResult.public_id,
        secureUrl: uploadResult.secure_url
      };
      await candidate.save();
    }

    emitProgress("Candidate saved..");
    await session.commitTransaction();
    res.json(candidate);
    Socket.globalSocket.emit("CANDIDATE_GET_BY_ID", { id: candidate._id });
  } catch (error) {
    console.log({ error });
    if (session) await session.abortTransaction();
    res.status(500).json({ error: { msg: "Please try again!" } });
  } finally {
    if (session) session.endSession();
  }
};

exports.deleteCandidateById = async (req, res) => {
  const { candidateId } = req.params;
  try {
    const candidate = await db.Candidate.findById(candidateId);
    await cloudinary.v2.uploader.destroy(candidate.image.publicId);
    await candidate.remove();
    res.json({ id: candidate._id });
    Socket.globalSocket.emit("CANDIDATE_REMOVE_BY_ID", { id: candidate._id });
  } catch (error) {
    console.log({ error });
    res.status(500).json({ error: { msg: "Please try again!" } });
  }
};
