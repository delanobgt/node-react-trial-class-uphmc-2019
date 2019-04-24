const _ = require("lodash");
const jwt = require("jwt-simple");
const moment = require("moment");
const crypto = require("crypto");
const db = require("../models/");
const Socket = require("../services/socket");

function encodeToken(token) {
  return jwt.encode(token, process.env.JWT_TOKEN_SECRET);
}

exports.signIn = async (req, res) => {
  // User has already had their email and password auth'd
  // We just need to give them a token
  try {
    const user = await db.User.findById(req.user._id);
    user.authToken = {
      value: (await crypto.randomBytes(48)).toString("hex"),
      expiresAt: moment()
        .add(6, "hours")
        .toDate()
        .getTime(),
      issuedAt: new Date().getTime()
    };
    await user.save();
    const token = {
      userId: user._id,
      token: user.authToken.value
    };
    res.json({
      token: encodeToken(token),
      expiresAt: user.authToken.expiresAt
    });
    Socket.globalSocket.emit("USER_GET_BY_ID", { id: user._id });
    if (Socket.userSockets[user._id])
      Socket.userSockets[user._id].forEach(socket =>
        socket.emit("SELF_PROFILE_GET")
      );
  } catch (error) {
    console.log({ error });
    res.status(500).send("<pre>Please try again!</pre>");
  }
};

exports.signOut = async (req, res) => {
  try {
    const user = await db.User.findById(req.user._id);
    user.authToken = null;
    await user.save();
    res.json({ token: "" });
  } catch (error) {
    console.log({ error });
    res.status(500).json({ error: { msg: "Please try again!" } });
  }
};
