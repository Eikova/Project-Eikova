const nodemailer = require('nodemailer');
const config = require('../config/config');
const logger = require('../config/logger');

const transport = nodemailer.createTransport(config.email.smtp);
/* istanbul ignore next */
if (config.env !== 'test') {
  transport
    .verify()
    .then(() => logger.info('Connected to email server'))
    .catch(() => logger.warn('Unable to connect to email server. Make sure you have configured the SMTP options in .env'));
}

/**
 * Send an email
 * @param {string} to
 * @param {string} subject
 * @param {string} text
 * @returns {Promise}
 */
const sendEmail = async (to, subject, text) => {
  const msg = { from: config.email.from, to, subject, text };
  await transport.sendMail(msg);
  logger.info(`New Email sent to address (${to}) with subject (${subject}).`);
};

/**
 * Send reset password email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendResetPasswordEmail = async (to, token) => {
  const subject = 'Reset password';
  // replace this url with the link to the reset password page of your front-end app
  const resetPasswordUrl = `http://eikova.photos/reset-password?token=${token}`;
  const text = `Dear user,
To reset your password, click on this link: ${resetPasswordUrl}
If you did not request any password resets, then ignore this email.`;
  await sendEmail(to, subject, text);
};

/**
 * Send verification email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendVerificationEmail = async (to, token) => {
  const subject = 'Email Verification';
  // replace this url with the link to the email verification page of your front-end app
  const verificationEmailUrl = `http://eikova.photos/verify-email?token=${token}`;
  const text = `Dear user,
To verify your email, click on this link: ${verificationEmailUrl}
If you did not create an account, then ignore this email.`;
  await sendEmail(to, subject, text);
};

const sendInviteEmail = async (to, token , name) => {
  const subject = 'Eikova Invite';
  // replace this url with the link to the email verification page of your front-end app
  const inviteUrl = `https://eikova.photos/auth/verify-invite?token=${token}`;
  const text = `Hi ${name}, Welcome to Eikova, to complete your registration kindly click on the link ${inviteUrl}`;
  await sendEmail(to, subject, text);
};

const resendInviteEmail = async (to, token) => {
  const subject = 'Eikova Invite';
  // replace this url with the link to the email verification page of your front-end app
  const inviteUrl = `https://eikova.photos/auth/verify-invite?token=${token}`;
  const text = `Hi, Welcome to Eikova, to complete your registration kindly click on the link ${inviteUrl}`;
  await sendEmail(to, subject, text);
};

const sendUserInviteEmail = async (to, token) => {
  const subject = 'Eikova Invite';
  // replace this url with the link to the email verification page of your front-end app
  const text = `Hi, Welcome to Eikova, to download pictures, kindly use this passcode:  ${token}`;
  await sendEmail(to, subject, text);
};

module.exports = {
  transport,
  sendEmail,
  sendResetPasswordEmail,
  sendVerificationEmail,
  sendInviteEmail,
  sendUserInviteEmail,
  resendInviteEmail,
};
