const _ = require("lodash");
const moment = require("moment");

const db = require("../models");
const Socket = require("../services/socket");

exports.createParticipant = async (req, res) => {
  const { fullname, email, courses } = req.body;
  try {
    const participant = new db.Participant({
      fullname,
      email,
      timestamps: {},
      courses
    });
    await participant.save();
    res.json(participant);
    Socket.globalSocket.emit("PARTICIPANT_GET_BY_ID", { id: participant._id });
  } catch (error) {
    console.log({ error });
    res.status(500).json({ error: { msg: "Please try again!" } });
  }
};

exports.getParticipants = async (req, res) => {
  try {
    const participants = await db.Participant.find({});
    res.json(participants);
  } catch (error) {
    console.log({ error });
    res.status(500).json({ error: { msg: "Please try again!" } });
  }
};

exports.getParticipantById = async (req, res) => {
  const { participantId } = req.params;
  try {
    const participant = await db.Participant.findById(participantId);
    res.json(participant);
  } catch (error) {
    console.log({ error });
    res.status(500).json({ error: { msg: "Please try again!" } });
  }
};

exports.updateParticipantById = async (req, res) => {
  const { participantId } = req.params;
  const { fullname, email, courses } = req.body;
  try {
    const participant = await db.Participant.findById(participantId);
    participant.fullname = fullname;
    participant.email = email;
    participant.courses = courses;
    await participant.save();
    res.json(participant);
    Socket.globalSocket.emit("PARTICIPANT_GET_BY_ID", { id: participant._id });
  } catch (error) {
    console.log({ error });
    res.status(500).json({ error: { msg: "Please try again!" } });
  }
};

exports.deleteParticipantById = async (req, res) => {
  const { participantId } = req.params;
  try {
    const participant = await db.Participant.findById(participantId);
    await participant.remove();
    res.json({ id: participant._id });
    Socket.globalSocket.emit("PARTICIPANT_REMOVE_BY_ID", {
      id: participant._id
    });
  } catch (error) {
    console.log({ error });
    res.status(500).json({ error: { msg: "Please try again!" } });
  }
};
