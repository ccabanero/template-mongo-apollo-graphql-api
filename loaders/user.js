const User = require('../database/models/user');

module.exports.batchUsers = async (userIds) => {
  const users = await User.find({ _id: { $in: userIds } });
  return userIds.map((userId) => users.find((user) => user.id === userId));
};
