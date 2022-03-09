const Joi = require('joi');
const { password } = require('./custom.validation');

const register = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    name: Joi.string(),
    position: Joi.string(),
    department: Joi.string(),
    token: Joi.string()
  }),
};

const login = {
  body: Joi.object().keys({
    email: Joi.string().required(),
    password: Joi.string().required(),
  }),
};

const invite = {
  body: Joi.object().keys({
    name:  Joi.string().required(),
    email: Joi.string().required(),
    role: Joi.string().required(),

  }),
};

const invite2 = {
  body: Joi.object().keys({
    name:  Joi.string().required(),
    email: Joi.string().required(),
    role: Joi.string().required(),

  }),
};

const logout = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

const refreshTokens = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

const forgotPassword = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
  }),
};

const resetPassword = {
  query: Joi.object().keys({
    token: Joi.string().required(),
  }),
  body: Joi.object().keys({
    password: Joi.string().required().custom(password),
  }),
};

const verifyEmail = {
  query: Joi.object().keys({
    token: Joi.string().required(),
  }),
};

const verifyInvite = {
  query: Joi.object().keys({
    token: Joi.string().required(),
  }),
};

// const verifyUserInvite = {
//   query: Joi.object().keys({
//     token: Joi.string().required(),
//   }),
// };

// const loginUser = {
//   query: Joi.object().keys({
//     token: Joi.string().required(),
//   }),
// };

module.exports = {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  verifyEmail,
  invite,
  verifyInvite,
  invite2
};
