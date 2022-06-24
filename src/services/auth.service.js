const httpStatus = require('http-status');
const tokenService = require('./token.service');
const userService = require('./user.service');
const Token = require('../models/token.model');
const ApiError = require('../utils/ApiError');
const { tokenTypes } = require('../config/tokens');
const logger = require("../config/logger");



/**
 * Login with username and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<User>}
 */
const loginUserWithEmailAndPassword = async (email, password) => {

  const user = await userService.getUserByEmail(email);

  if (!user || !(await user.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
  }
  if(user.role === 'user'){
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Access Denied');
  }
  logger.info(`User with email: (${email}) signed in.`);
  return user;
};


/**
 * InviteUser
 * @returns {Promise}
 */


//Correct saving to DB before mail
const inviteUser = async(name,email,role,author)=>{
  if(author.role === 'admin' && (role=== 'super-admin' || role === 'admin' )){
    throw new ApiError(httpStatus.BAD_REQUEST, 'You are not allowed to perform this action');
  }

  if(role==='user'){
    throw new ApiError(httpStatus.BAD_REQUEST, 'You are not permitted to invite a user here');

  }

    // let user = await userService.getUserByEmail(email);
    // if(user){
    //   throw new ApiError(httpStatus.BAD_REQUEST, 'Invite already sent');
    // }

  let user = await userService.createUser({ name, email, role });
      const token = await tokenService.generateUserInvitationToken(user)

      logger.info(`User with email: (${email}) provisioned for ${role} role.`);
      return { user, token}

}


const resendInvite = async(author)=>{
  if(author.role === 'admin' && (role=== 'super-admin' || role === 'admin' )){
    throw new ApiError(httpStatus.BAD_REQUEST, 'You are not allowed to perform this action');
  }

  if(role==='user'){
    const token = await tokenService.generateUserInvitationToken(user)
    throw new ApiError(httpStatus.BAD_REQUEST, 'You are not permitted to invite a user here');

  }

  else{

  }

    // let user = await userService.getUserByEmail(email);
    // if(user){
    //   throw new ApiError(httpStatus.BAD_REQUEST, 'Invite already sent');
    // }
      //  user = await userService.createUser({name,email,role})
      // const token = await tokenService.generateUserInvitationToken(user)

      return { user, token}

}



/**
 * Verify Invite
 * @param {string} token
 * @returns {Promise}
 */

const verifyInvitation = async(token)=>{

  try{
  const verify = await tokenService.verifyToken(token,tokenTypes.USER_INVITATION)
  let user = await userService.getUserById(verify.user)
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  // await Token.deleteMany({ user: user.id, type: tokenTypes.USER_INVITATION });
  return user
}
catch{
  throw new ApiError(httpStatus.BAD_REQUEST, 'Email verification failed');
}

}
/**
 * Logout
 * @param {string} refreshToken
 * @returns {Promise}
 */

const logout = async (refreshToken) => {
  const refreshTokenDoc = await Token.findOne({ token: refreshToken, type: tokenTypes.REFRESH, blacklisted: false });
  if (!refreshTokenDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Not found');
  }
  await refreshTokenDoc.remove();
};

/**
 * Refresh auth tokens
 * @param {string} refreshToken
 * @returns {Promise<Object>}
 */
const refreshAuth = async (refreshToken) => {
  try {
    const refreshTokenDoc = await tokenService.verifyToken(refreshToken, tokenTypes.REFRESH);
    const user = await userService.getUserById(refreshTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await refreshTokenDoc.remove();
    return tokenService.generateAuthTokens(user);
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
  }
};

/**
 * Reset password
 * @param {string} resetPasswordToken
 * @param {string} newPassword
 * @returns {Promise}
 */
const resetPassword = async (resetPasswordToken, newPassword) => {
  try {
    const resetPasswordTokenDoc = await tokenService.verifyToken(resetPasswordToken, tokenTypes.RESET_PASSWORD);
    const user = await userService.getUserById(resetPasswordTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await userService.updateUserById(user.id, { password: newPassword });
    await Token.deleteMany({ user: user.id, type: tokenTypes.RESET_PASSWORD });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Password reset failed');
  }
};

/**
 * Verify email
 * @param {string} verifyEmailToken
 * @returns {Promise}
 */
// const verifyEmail = async (verifyEmailToken) => {
//   try {
//     const verifyEmailTokenDoc = await tokenService.verifyToken(verifyEmailToken, tokenTypes.VERIFY_EMAIL);
//     const user = await userService.getUserById(verifyEmailTokenDoc.user);
//     if (!user) {
//       throw new Error();
//     }
//     await Token.deleteMany({ user: user.id, type: tokenTypes.VERIFY_EMAIL });
//     await userService.updateUserById(user.id, { isEmailVerified: true });
//   } catch (error) {
//     throw new ApiError(httpStatus.UNAUTHORIZED, 'Email verification failed');
//   }
// };

/**
 * Verify user signup
 * @param {string} userSignUpToken
 * @returns {Promise}
 */
 const verifyUserSignUp = async (userSignUpToken) => {
  try {
    const userSignUpTokenDoc = await tokenService.verifyToken(userSignUpToken, tokenTypes.ACCESS);
    const user = await userService.getUserById(userSignUpTokenDoc.user);
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
    // if (user.status === 'deactivated') {
    //   throw new ApiError(httpStatus.UNAUTHORIZED, 'deactivated user');
    // }
    await Token.deleteMany({ user: user.id, type: tokenTypes.USER_SIGNUP });
    await userService.updateUserById(user, { status: 'enabled' });
    return user;
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'signup failed');
  }
};

// const resendInvite = async(email)=>{
//   const user = await authService.getUserByEmail(email)

//   if(user.role == 'user'){
//     const code = await OTPService.generateOTP(email)
//     await emailService.sendUserInviteEmail(email, code)
//   }
//   else{

//   }


//   }



module.exports = {
  loginUserWithEmailAndPassword,
  logout,
  refreshAuth,
  resetPassword,
  inviteUser,
  verifyInvitation,
  verifyUserSignUp
};
