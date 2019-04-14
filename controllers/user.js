const _ = require("lodash");
const db = require("../models");
const bcrypt = require("bcrypt-nodejs");
const crypto = require("crypto");
const moment = require("moment");
const mailer = require("../services/mailer");
const Socket = require("../services/socket");

function minifyUser(user) {
  user = user.toObject();
  return _.chain({ ...user, password: Boolean(user.password) })
    .pick([
      "_id",
      "email",
      "password",
      "role",
      "connected",
      "banned",
      "createdAt"
    ])
    .value();
}

function hashPassword(password) {
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(password, salt);
  return passwordHash;
}

// Self
exports.getSelfProfile = async (req, res) => {
  res.json(minifyUser(req.user));
};

exports.updateSelfEmail = async (req, res) => {
  const userId = req.user._id;
  const { email } = req.body;
  try {
    const duplicateUser = await db.User.findOne({ email });
    if (duplicateUser)
      return res
        .status(422)
        .json({ error: { msg: "Email is already in use!" } });

    const user = await db.User.findById(userId);
    user.email = email;
    await user.save();
    res.json(minifyUser(user));
    Socket.globalSocket.emit("USER_GET_BY_ID", { id: user._id });
  } catch (error) {
    console.log({ error });
    res.status(500).json({ error: { msg: "Please try again!" } });
  }
};

exports.updateSelfPassword = async (req, res) => {
  const userId = req.user._id;
  const { oldPassword, newPassword } = req.body;
  try {
    const user = await db.User.findById(userId);
    if (user.comparePassword(oldPassword)) {
      user.password = hashPassword(newPassword);
      await user.save();
      res.json(minifyUser(user));
    } else {
      res.status(500).json({ error: { msg: `Old password do not match!` } });
    }
  } catch (error) {
    console.log({ error });
    res.status(500).json({ error: { msg: "Please try again!" } });
  }
};

// Forget Password
exports.sendForgetUserPasswordEmail = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await db.User.findOne({ email });
    if (!user)
      return res.status(422).json({ error: { msg: `Email not found!` } });

    user.resetPasswordToken = {
      value: (await crypto.randomBytes(48)).toString("hex"),
      issuedAt: moment()
        .toDate()
        .getTime(),
      expiresAt: moment()
        .add(10, "minutes")
        .toDate()
        .getTime()
    };

    await mailer.sendForgetUserPasswordEmail({
      recipientEmail: user.email,
      payload: {
        originUrl: req.locals.originUrl,
        ...user.toObject()
      }
    });
    await user.save();
    res.json({ success: true });
  } catch (error) {
    console.log({ error });
    res.status(500).json({ error: { msg: "Please try again!" } });
  }
};

exports.updateUserPasswordById = async (req, res) => {
  const { userId } = req.params;
  const { newPassword } = req.body;
  try {
    const user = await db.User.findById(userId);
    user.password = hashPassword(newPassword);
    user.resetPasswordToken = null;
    await user.save();
    res.json({ success: true });
  } catch (error) {
    console.log({ error });
    res.status(500).json({ error: { msg: "Please try again!" } });
  }
};

exports.checkResetUserPasswordToken = async (req, res, next) => {
  const { userId } = req.params;
  const incomingTokenValue = req.body.token;
  try {
    const user = await db.User.findById(userId);
    if (!user)
      return res.status(422).json({ error: { msg: "User not found!" } });
    if (user.banned)
      return res.status(422).json({ error: { msg: "User banned!" } });

    const savedToken = user.resetPasswordToken;
    if (!savedToken || savedToken.value !== incomingTokenValue)
      return res.status(422).json({ error: { msg: "Token mismatched!" } });
    if (
      savedToken.expiresAt != -1 &&
      savedToken.expiresAt < new Date().getTime()
    )
      return res.status(422).json({ error: { msg: "Token expired!" } });

    next();
  } catch (error) {
    console.log({ error });
    res.status(500).json({ error: { msg: "Please try again!" } });
  }
};

// Users
exports.createUser = async (req, res) => {
  const { email } = req.body;
  try {
    const foundUser = await db.User.findOne({ email });
    if (foundUser)
      return res.status(422).json({ error: { msg: "Email already exists!" } });

    const newUser = new db.User({ email });
    newUser.resetPasswordToken = {
      value: (await crypto.randomBytes(48)).toString("hex"),
      issuedAt: moment()
        .toDate()
        .getTime(),
      expiresAt: -1
    };
    await mailer.sendNewUserEmail({
      recipientEmail: newUser.email,
      payload: {
        originUrl: req.locals.originUrl,
        ...newUser.toObject()
      }
    });
    await newUser.save();
    res.json(minifyUser(newUser));
    Socket.globalSocket.emit("USER_GET_BY_ID", { id: newUser._id });
  } catch (error) {
    console.log({ error });
    res.status(500).json({ error: { msg: "Please try again!" } });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await db.User.find({});
    const formattedUsers = _.map(users, user => minifyUser(user));
    res.json(formattedUsers);
  } catch (error) {
    console.log({ error });
    res.status(500).json({ error });
  }
};

exports.getUserById = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await db.User.findById(userId);
    res.json(minifyUser(user));
  } catch (error) {
    console.log({ error });
    res.status(500).json({ error });
  }
};

exports.getAllRoles = async (req, res) => {
  try {
    const roles = db.User.schema.path("role").enumValues;
    res.json(roles);
  } catch (error) {
    console.log({ error });
    res.status(500).json({ error });
  }
};

exports.updateUserById = async (req, res) => {
  const { userId } = req.params;
  const { role, banned } = req.body;
  try {
    const user = await db.User.findById(userId);
    if (role) {
      user.role = role;
    }
    if (banned !== undefined && banned !== null) {
      user.banned = Boolean(banned);
    }
    await user.save();
    res.json(minifyUser(user));
    Socket.globalSocket.emit("USER_GET_BY_ID", { id: user._id });
    Socket.userSockets[user._id].forEach(socket =>
      socket.emit("SELF_PROFILE_GET")
    );
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
};

exports.deleteUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await db.User.findById(userId);
    await user.remove();
    res.json({ id: user._id });
    Socket.globalSocket.emit("USER_REMOVE_BY_ID", { id: user._id });
    Socket.userSockets[user._id].forEach(socket =>
      socket.emit("SELF_PROFILE_GET")
    );
  } catch (error) {
    res.status(500).json({ error });
  }
};

exports.resetUserPasswordById = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await db.User.findById(userId);
    user.authToken = null;
    user.password = null;
    user.resetPasswordToken = {
      value: (await crypto.randomBytes(48)).toString("hex"),
      issuedAt: moment()
        .toDate()
        .getTime(),
      expiresAt: -1
    };

    await mailer.sendResetUserPasswordEmail({
      recipientEmail: user.email,
      payload: {
        originUrl: req.locals.originUrl,
        ...user.toObject()
      }
    });
    await user.save();
    res.json({ success: true });
    Socket.globalSocket.emit("USER_GET_BY_ID", { id: user._id });
    Socket.userSockets[user._id].forEach(socket =>
      socket.emit("SELF_PROFILE_GET")
    );
  } catch (error) {
    console.log({ error });
    res.status(500).json({ error: { msg: "Please try again!" } });
  }
};
