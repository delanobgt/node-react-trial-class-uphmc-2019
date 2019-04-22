const mongoose = require("mongoose");

const captchaSchema = new mongoose.Schema(
  {
    ip: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    value: {
      type: String,
      required: true
    },
    remainingTry: {
      type: Number,
      required: true
    },
    validUntil: {
      type: Number,
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("captcha", captchaSchema);
