const httpStatus = require('http-status');
const { USE_PROXY } = require('http-status');
const { User } = require('../models');
const ApiError = require('../utils/ApiError');
const { tokenTypes } = require('../config/tokens');
const Token = require('../models/token.model');

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (userBody) => {
  if (await User.isEmailTaken(userBody.email)) {
    const user = await getUserByEmail(userBody.email);
    //check if a user has been deleted so that he can be re invited again
    if (user.isDeleted === false) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
    } else {
      //now delete the user to add the user again
      await deleteUserById(user.id);
    }
  }
  return User.create(userBody);
};

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryUsers = async (filter, options) => {
  filter.isDeleted = false;
  const users = await User.paginate(filter, options);
  return users;
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = async (id) => {
  return User.findById(id);
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email) => {
  return User.findOne({ email });
};

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUserById = async (userId, updateBody) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (updateBody.email && (await User.isEmailTaken(updateBody.email, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  Object.assign(user, updateBody);
  await user.save();
  return user;
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const deleteUserById = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  await user.remove();
  return user;
};

const searchUsers = async (user, options) => {
  const users = await User.paginate({ username: { $regex: user, $options: 'i' } }, options);
  if (!users) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No User found');
  }
  return users;
};

const toggleStatus = async (userId, actor) => {
  let updateBody;
  const user = await getUserById(userId);

  if (actor.role === 'admin' && user.role === 'admin') {
    throw new ApiError(httpStatus.FORBIDDEN, 'You are not allowed to perform this action');
  }

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (user.status === 'enabled') {
    updateBody = { status: 'disabled' };
    await Token.deleteMany({ user: user.id, type: tokenTypes.ACCESS });
  } else {
    updateBody = { status: 'enabled' };
  }
  Object.assign(user, updateBody);
  await user.save();
  return user;
};

const deleteUser = async (userId) => {
  let updateBody;
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (user.isDeleted === true) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User already Deleted');
  } else {
    updateBody = { isDeleted: true };
  }
  Object.assign(user, updateBody);
  await user.save();
  return user;
};

module.exports = {
  createUser,
  queryUsers,
  getUserById,
  getUserByEmail,
  updateUserById,
  deleteUserById,
  toggleStatus,
  deleteUser,
  searchUsers,
};
