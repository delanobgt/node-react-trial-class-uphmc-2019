const mongoose = require("mongoose");

const configurationSchema = new mongoose.Schema(
  {
    openTimestamp: {
      type: Date,
      required: true
    },
    closeTimestamp: {
      type: Date,
      required: true
    },
    onAir: {
      type: Boolean,
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("configuration", configurationSchema);
