const nodemailer = require("nodemailer");
const path = require("path");
const util = require("util");
const fs = require("fs");
const readFile = util.promisify(fs.readFile);
const ejs = require("ejs");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    type: "OAuth2",
    user: process.env.GMAIL_USERNAME,
    clientId: process.env.GMAIL_CLIENT_ID,
    clientSecret: process.env.GMAIL_CLIENT_SECRET,
    refreshToken: process.env.GMAIL_REFRESH_TOKEN,
    accessToken: process.env.GMAIL_ACCESS_TOKEN
  }
});

async function sendEmail(mailOptions) {
  return await transporter.sendMail({
    ...mailOptions,
    from: process.env.GMAIL_USERNAME
  });
}

exports.sendNewUserEmail = async ({ recipientEmail, payload }) => {
  const {
    _id,
    email,
    originUrl,
    resetPasswordToken: { value }
  } = payload;
  const resetPasswordLink = `${originUrl}/resetPassword/users/${_id}/email/${email}/token/${value}`;
  const ejsPath = path.join(__dirname, "templates", "NewUser.html");
  const templateEjs = await readFile(ejsPath, "utf-8");
  const renderedHtml = ejs.render(templateEjs, {
    payload: { ...payload, resetPasswordLink }
  });
  const mailOptions = {
    to: recipientEmail,
    subject: `Welcome to Attendance System (Trial Class UPHMC 2019)`,
    html: renderedHtml
  };
  await sendEmail(mailOptions);
};

exports.sendForgetUserPasswordEmail = async ({ recipientEmail, payload }) => {
  const {
    _id,
    email,
    originUrl,
    resetPasswordToken: { value }
  } = payload;
  const resetPasswordLink = `${originUrl}/resetPassword/users/${_id}/email/${email}/token/${value}`;
  const ejsPath = path.join(__dirname, "templates", "ForgetUserPassword.html");
  const templateEjs = await readFile(ejsPath, "utf-8");
  const renderedHtml = ejs.render(templateEjs, {
    payload: { ...payload, resetPasswordLink }
  });
  const mailOptions = {
    to: recipientEmail,
    subject: `Forgot Password for Attendance System (Trial Class UPHMC 2019)`,
    html: renderedHtml
  };
  await sendEmail(mailOptions);
};

exports.sendResetUserPasswordEmail = async ({ recipientEmail, payload }) => {
  const {
    _id,
    email,
    originUrl,
    resetPasswordToken: { value }
  } = payload;
  const resetPasswordLink = `${originUrl}/resetPassword/users/${_id}/email/${email}/token/${value}`;
  const ejsPath = path.join(__dirname, "templates", "ResetUserPassword.html");
  const templateEjs = await readFile(ejsPath, "utf-8");
  const renderedHtml = ejs.render(templateEjs, {
    payload: { ...payload, resetPasswordLink }
  });
  const mailOptions = {
    to: recipientEmail,
    subject: `Reset Password for Attendance System (Trial Class UPHMC 2019)`,
    html: renderedHtml
  };
  await sendEmail(mailOptions);
};

exports.sendFormStatusEmail = async ({ recipientEmail, payload }) => {
  const { _id, fullname, courses, hostUrl } = payload;

  const qrCodeLink = `${hostUrl}/api/qrCode/generate/${_id}`;

  const ejsPath = path.join(__dirname, "templates", "ParticipantStatus.html");
  const templateEjs = await readFile(ejsPath, "utf-8");
  const renderedHtml = ejs.render(templateEjs, {
    payload: {
      ...payload,
      qrCodeLink
    }
  });
  const mailOptions = {
    to: recipientEmail,
    subject: `Trial Class 2019`,
    html: renderedHtml
  };
  await sendEmail(mailOptions);
};
