const mongoose = require("mongoose");

const voteTokenSchema = new mongoose.Schema(
  {
    value: {
      type: String,
      required: true,
      unique: true
    },
    candidateId: {
      type: mongoose.Schema.Types.ObjectId
    },
    usedAt: {
      type: Date
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("vote_token", voteTokenSchema);
