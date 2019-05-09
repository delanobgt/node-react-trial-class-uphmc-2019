const mongoose = require("mongoose");

const configurationSchema = new mongoose.Schema(
  {
    managementDate: {
      type: Date,
      required: true
    },
    accountingDate: {
      type: Date,
      required: true
    },
    hospitalityDate: {
      type: Date,
      required: true
    },
    systechDate: {
      type: Date,
      required: true
    },
    lawDate: {
      type: Date,
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("configuration", configurationSchema);
