const mongoose = require("mongoose");

const DATABASE_URL = process.env.DATABASE_URL || "mongodb://localhost/hris";
mongoose.connect(DATABASE_URL);

exports.Candidate = require("./candidate");
exports.Configuration = require("./configuration");
exports.User = require("./user");
exports.VoteToken = require("./voteToken");
