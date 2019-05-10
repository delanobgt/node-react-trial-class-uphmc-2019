const mongoose = require("mongoose");

const participantSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    timestamps: {
      managementTimestamp: Date,
      accountingTimestamp: Date,
      hospitalityTimestamp: Date,
      systechTimestamp: Date,
      lawTimestamp: Date
    },
    courses: [
      {
        type: String,
        enum: ["Management", "Accounting", "Hospitality", "Systech", "Law"]
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("participant", participantSchema);
