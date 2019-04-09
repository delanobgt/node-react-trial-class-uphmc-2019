const _ = require("lodash");
const moment = require("moment");
const db = require("../models");

exports.ensureConfigurationExists = async (req, res, next) => {
  try {
    const configuration = await db.Configuration.findOne({});
    if (!configuration) {
      await db.Configuration.create({
        openTimestamp: moment().toDate(),
        closeTimestamp: moment()
          .add(1, "days")
          .toDate(),
        onAir: true
      });
    }
    next();
  } catch (error) {
    console.log({ error });
    res
      .status(500)
      .json({ error: { msg: "Failed to ensure configuration exists!" } });
  }
};

exports.getConfiguration = async (req, res) => {
  try {
    const configuration = await db.Configuration.findOne({});
    res.json(configuration);
  } catch (error) {
    console.log({ error });
    res.status(500).json({ error: { msg: "Please try again!" } });
  }
};

exports.updateConfiguration = async (req, res) => {
  const { openTimestamp, closeTimestamp, onAir } = req.body;
  try {
    const configuration = await db.Configuration.findOne({});

    if (openTimestamp)
      configuration.openTimestamp = moment(openTimestamp).toDate();

    if (closeTimestamp)
      configuration.closeTimestamp = moment(closeTimestamp).toDate();

    if (onAir) configuration.onAir = Boolean(onAir);

    await configuration.save();
    res.json(configuration);
  } catch (error) {
    console.log({ error });
    res.status(500).json({ error: { msg: "Please try again!" } });
  }
};
