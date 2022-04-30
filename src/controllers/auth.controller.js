const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { authService, userService, tokenService, emailService, OTPService } = require('../services');
const ApiError = require('../utils/ApiError');

const register = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  const tokens = await tokenService.generateAuthTokens(user);
  res.status(httpStatus.CREATED).send({ user, tokens });
});

const inviteUser = catchAsync(async (req, res) => {
  const { email, username } = req.body;
  const otp = await OTPService.generateOTP(email);
  const user = await userService.getUserByEmail(email);
  if (!user) {
    await userService.createUser({ email, username, role: 'user' });
  }

  console.log(otp);
  await emailService.sendUserInviteEmail(email, otp.code, username);
  res.status(httpStatus.OK).send('Invite sent Successfully');
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  //ensure other users can login with this route too
  const user = await userService.getUserByEmail(email);
  if (user.role !== 'user') {
    const user = await authService.loginUserWithEmailAndPassword(email, password);
    const tokens = await tokenService.generateAuthTokens(user);
    res.send({ user, tokens });
  } else {
    const verify = await OTPService.verifyOTP(email, password);

    if (!verify) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'invalid Email or Token');
    }

    const getUser = await userService.getUserByEmail(email);
    if (getUser) {
      const user = await userService.updateUserById(getUser.id, { status: 'enabled' });
      const tokens = await tokenService.generateOneTimeToken(getUser);
      res.send({ user, tokens });
    } else {
      throw new ApiError(httpStatus.BAD_REQUEST, 'invalid credentials');
    }
  }
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
  res.status(httpStatus.OK).send('password reset successfully');
});

const verifyInvite = catchAsync(async (req, res) => {
  const user = await authService.verifyInvitation(req.query.token);
  const token = await tokenService.generateSignUpToken(user);
  res.send({ user, token, redirectUrl: `https://frontend.com?token=${token}&email=${user.email}` });
});

const invite = catchAsync(async (req, res) => {
  const { name, email, role } = req.body;
  //send Email before saving to DB
  let user = await userService.getUserByEmail(email);
  if (user) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User already Exists');
  }
  user = await authService.inviteUser(name, email, role, req.user);
  await emailService.sendInviteEmail(email, user.token.userInvitationToken, name);
  res.status(httpStatus.OK).send('Invite sent Successfully');
});

const completeSignup = catchAsync(async (req, res) => {
  let user = await authService.verifyUserSignUp(req.body.token);

  const { email } = user;
  if (req.body.email !== email) {
    throw new ApiError(httpStatus.BAD_REQUEST, ERROR_MESSAGES.EMAIL_NOT_MATCHING_USER);
  }

  user = await userService.getUserById(user.id);

  user = await userService.updateUserById(user.id, req.body);
  const tokens = await tokenService.generateAuthTokens(user);

  res.send({ user, tokens });
});

module.exports = {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  invite,
  verifyInvite,
  completeSignup,
  inviteUser,
};
