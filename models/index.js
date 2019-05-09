const mongoose = require("mongoose");

const DATABASE_URL =
  process.env.DATABASE_URL || "mongodb://localhost/trialclass";
mongoose.connect(DATABASE_URL);

exports.Configuration = require("./configuration");
exports.User = require("./user");
