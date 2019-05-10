const _ = require("lodash");
const moment = require("moment");

const db = require("../models");
const Socket = require("../services/socket");
const mailer = require("../services/mailer");

exports.createParticipant = async (req, res) => {
  const { fullname, email, courses } = req.body;
  try {
    const participant = new db.Participant({
      fullname,
      email,
      timestamps: {
        managementTimestamp: null,
        accountingTimestamp: null,
        hospitalityTimestamp: null,
        systechTimestamp: null,
        lawTimestamp: null
      },
      courses
    });
    await mailer.sendFormStatusEmail({
      recipientEmail: email,
      payload: {
        hostUrl: req.locals.hostUrl,
        ...participant.toObject()
      }
    });
    await participant.save();
    res.json(participant);
    Socket.globalSocket.emit("PARTICIPANT_GET_BY_ID", { id: participant._id });
  } catch (error) {
    console.log({ error });
    res.status(500).json({ error: { msg: "Please try again!" } });
  }
};

exports.signInParticipantById = async (req, res) => {
  const { participantId } = req.params;
  try {
    const participant = await db.Participant.findById(participantId);
    if (!participant) {
      return res.status(422).json({
        error: { type: "ERROR", msg: "Participant doesn't exist!" }
      });
    }
    const config = await db.Configuration.findOne({});
    const currentMoment = moment();

    let todayCourse = null;
    const allCourses = [
      "Management",
      "Accounting",
      "Hospitality",
      "Systech",
      "Law"
    ];
    for (const course of allCourses) {
      const currentKey = _.lowerCase(course) + "Date";
      if (
        moment(config[currentKey]).valueOf() <= currentMoment.valueOf() &&
        currentMoment.valueOf() <
          moment(config[currentKey])
            .add(1, "days")
            .valueOf()
      ) {
        todayCourse = course;
        break;
      }
    }

    if (!todayCourse) {
      return res.status(422).json({
        error: { type: "ERROR", msg: "No available course today!" }
      });
    }
    if (!participant.courses.includes(todayCourse)) {
      return res.status(422).json({
        error: {
          type: "ERROR",
          todayCourse,
          msg: "Participant is not enrolled!"
        }
      });
    }
    if (participant.timestamps[_.lowerCase(todayCourse) + "Timestamp"]) {
      return res.status(422).json({
        error: { type: "WARNING", msg: "Participant already signed in!" }
      });
    }

    participant.timestamps[
      _.lowerCase(todayCourse) + "Timestamp"
    ] = currentMoment.toDate();

    await participant.save();
    res.json({ ...participant.toObject(), todayCourse });
    Socket.globalSocket.emit("PARTICIPANT_GET_BY_ID", { id: participant._id });
  } catch (error) {
    console.log({ error });
    res
      .status(500)
      .json({ error: { type: "ERROR", msg: "Please try again!" } });
  }
};

exports.sendParticipantEmailById = async (req, res) => {
  const { participantId } = req.params;
  try {
    const participant = await db.Participant.findById(participantId);
    await mailer.sendFormStatusEmail({
      recipientEmail: participant.email,
      payload: {
        hostUrl: req.locals.hostUrl,
        ...participant.toObject()
      }
    });
    res.json({ success: true });
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
