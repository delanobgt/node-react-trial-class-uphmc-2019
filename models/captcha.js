const mongoose = require("mongoose");

const captchaSchema = new mongoose.Schema(
  {
    myOwnUniqueId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    value: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("captcha", captchaSchema);
