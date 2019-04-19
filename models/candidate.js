const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  publicId: {
    type: String,
    required: true
  },
  secureUrl: {
    type: String,
    required: true
  }
});

const candidateSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: Number,
      required: true,
      unique: true
    },
    fullname: {
      type: String,
      required: true,
      unique: true
    },
    major: {
      type: String,
      required: true
    },
    image: {
      type: imageSchema,
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("candidate", candidateSchema);
