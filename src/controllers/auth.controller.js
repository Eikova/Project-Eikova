const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { authService, userService, tokenService, emailService, otpService } = require('../services');
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


const inviteUser = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const otp = await otpService.generateOTP (email, password);
  await emailService.sendUserInviteEmail(email, otp.code);
  res.status(httpStatus.NO_CONTENT).send();
});

const userLogin = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const verify = await otpService.verifyOTP(email, password);
  console.log(verify)
  if(!verify){
    throw new ApiError(httpStatus.BAD_REQUEST, 'invalid Email or Token');
  }
  const getUser = await userService.getUserByEmail(email)
  if(!getUser){
    let user = await userService.createUser(req.body);
    user = await userService.updateUserById(user.id, {status:'active'});
    const tokens = await tokenService.generateOneTimeToken(user);
    res.send({ user, tokens });
  }
  else{
    const tokens = await tokenService.generateOneTimeToken(getUser);
    res.send({ user:getUser, tokens });
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
  res.status(httpStatus.NO_CONTENT).send();
});


const verifyInvite = catchAsync(async (req, res) => {
  const user = await authService.verifyInvitation(req.query.token);
  console.log(user)
  const token = await tokenService.generateSignUpToken(user);
  res.send({ user, token, redirectUrl: `http://frontend.com?token=${token}&email=${user.email}` });
});


const invite = catchAsync(async (req, res) => {
  const { name, email, role } = req.body;
  const user = await authService.inviteUser(name,email,role);
  //if User is a user, send Code, else, send, email link
  await emailService.sendInviteEmail(email, user.token.userInvitationToken);
  res.status(httpStatus.NO_CONTENT).send();
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
  userLogin,
  inviteUser
};
