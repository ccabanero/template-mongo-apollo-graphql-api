const { skip } = require('graphql-resolvers');

const Sale = require('../../database/models/sale');

const { isValidObjectId } = require('../../database/util');

module.exports.isAuthenticated = (parent, args, context) => {
  const { email } = context;
  if (!email) {
    throw new Error('Access Denied! Please login to continue');
  }
  return skip;
};

module.exports.isSaleOwner = async (parent, args, context) => {
  try {
    const { id } = args;
    const { loggedInUserId } = context;
    if (!isValidObjectId(id)) {
      throw new Error('Invalid Sale id');
    }
    const sale = await Sale.findById(id);
    if (!sale) {
      throw new Error('Sale not found');
    } else if (sale.user.toString() !== loggedInUserId) {
      throw new Error('Not authorized as sale owner');
    }
    return skip;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
    throw error;
  }
};
