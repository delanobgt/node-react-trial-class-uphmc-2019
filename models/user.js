const mongoose = require("mongoose");
const bcrypt = require("bcrypt-nodejs");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      lowercase: true,
      required: true
    },
    password: {
      type: String
    },
    role: {
      type: String,
      enum: ["SUPER_ADMIN", "ADMIN"],
      default: "ADMIN",
      required: true
    },

    authToken: {
      value: String,
      expiresAt: Number,
      issuedAt: Number
    },

    resetPasswordToken: {
      value: String,
      expiresAt: Number,
      issuedAt: Number
    },

    connected: {
      type: Boolean,
      default: false,
      required: true
    },
    banned: {
      type: Boolean,
      default: false,
      required: true
    }
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = function(candidatePassword) {
  return bcrypt.compareSync(candidatePassword, this.password);
};

module.exports = mongoose.model("user", userSchema);
