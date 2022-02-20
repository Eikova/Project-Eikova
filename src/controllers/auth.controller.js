const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { authService, userService, tokenService, emailService } = require('../services');
const ApiError = require('../utils/ApiError');

const register = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  const tokens = await tokenService.generateAuthTokens(user);
  res.status(httpStatus.CREATED).send({ user, tokens });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.loginUserWithEmailAndPassword(email, password);
  const tokens = await tokenService.generateAuthTokens(user);
  res.send({ user, tokens });
});

const logout = catchAsync(async (req, res) => {
  await authService.logout(req.body.refreshToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await authService.refreshAuth(req.body.refreshToken);
  res.send({ ...tokens });
});

const forgotPassword = catchAsync(async (req, res) => {
  const resetPasswordToken = await tokenService.generateResetPasswordToken(req.body.email);
  await emailService.sendResetPasswordEmail(req.body.email, resetPasswordToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const resetPassword = catchAsync(async (req, res) => {
  await authService.resetPassword(req.query.token, req.body.password);
  res.status(httpStatus.NO_CONTENT).send();
});


const verifyUserInvitation = catchAsync(async (req, res) => {
  const user = await authService.verifyInvitation(req.query.token);
  console.log(user)
  const token = await tokenService.generateSignUpToken(user);
  // console.log(token)
  res.send({ user, token, redirectUrl: `http://frontend.com?token=${token}&email=${user.email}` });
});


const sendInvite = catchAsync(async (req, res) => {
  const { name, email, role } = req.body;
  const user = await authService.inviteUser(name,email,role);
  //if User is a user, send Code, else, send, email link
  await emailService.sendInviteEmail(email, user.token.userInvitationToken);
  res.status(httpStatus.OK).send(user);
});

const userSignUp = catchAsync(async (req, res) => {
  console.log(req.body.token,"======> Body Token")
  let user = await authService.verifyUserSignUp(req.body.token);

  const { email } = user;
  if (req.body.email !== email) {
    throw new ApiError(httpStatus.BAD_REQUEST, ERROR_MESSAGES.EMAIL_NOT_MATCHING_USER);
  }

  user = await userService.getUserById(user.id);

  user = await userService.updateUserById(user.id, req.body);
  // user = await userService.getUserById(user.id, ['workspace']);
  const tokens = await tokenService.generateAuthTokens(user);
  // onboardingService.createOnboarding({ user: user.id, stages: [ONBOARDING_STAGES.USER.SIGNED_UP] });

  res.send({ user, tokens });
});

module.exports = {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  sendInvite,
  verifyUserInvitation,
  userSignUp
};
