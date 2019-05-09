const _ = require("lodash");
const moment = require("moment");

const db = require("../models");

exports.ensureConfigurationExists = async (req, res, next) => {
  try {
    const configuration = await db.Configuration.findOne({});
    if (!configuration) {
      await db.Configuration.create({
        managementDate: moment()
          .startOf("day")
          .toDate(),
        accountingDate: moment()
          .startOf("day")
          .toDate(),
        hospitalityDate: moment()
          .startOf("day")
          .toDate(),
        systechDate: moment()
          .startOf("day")
          .toDate(),
        lawDate: moment()
          .startOf("day")
          .toDate()
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
  const {
    managementDate,
    accountingDate,
    hospitalityDate,
    systechDate,
    lawDate
  } = req.body;
  try {
    const configuration = await db.Configuration.findOne({});

    if (managementDate)
      configuration.managementDate = moment(managementDate).toDate();

    if (accountingDate)
      configuration.accountingDate = moment(accountingDate).toDate();

    if (hospitalityDate)
      configuration.hospitalityDate = moment(hospitalityDate).toDate();

    if (systechDate) configuration.systechDate = moment(systechDate).toDate();

    if (lawDate) configuration.lawDate = moment(lawDate).toDate();

    await configuration.save();
    res.json(configuration);
  } catch (error) {
    console.log({ error });
    res.status(500).json({ error: { msg: "Please try again!" } });
  }
};
