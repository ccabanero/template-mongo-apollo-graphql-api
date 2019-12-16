const { combineResolvers } = require('graphql-resolvers');

// const { users, sales } = require('../constants');
const Sale = require('../database/models/sale');
const User = require('../database/models/user');
const { isAuthenticated, isSaleOwner } = require('./middleware');

module.exports = {
  // query resolvers
  Query: {
    /**
     * Finds all sales owned by the authenticated user.
     */
    salesByOwner: combineResolvers(isAuthenticated, async (parent, args, context) => {
      try {
        const { skip, limit } = args;
        const { loggedInUserId } = context;
        const sales = await Sale.find({ user: loggedInUserId })
          .sort({ _id: -1 })
          .skip(skip)
          .limit(limit);
        return sales;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error);
        throw error;
      }
    }),
    /**
     * Finds sale by id, owned by the authenticated user.
     */
    saleByOwner: combineResolvers(isAuthenticated, isSaleOwner, async (_, args) => {
      try {
        const { id } = args;
        const sale = await Sale.findById(id);
        return sale;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error);
        throw error;
      }
    }),
  },
  // mutation resolvers
  Mutation: {
    /**
     * Creates a new sale, owned by the authenticated user.
     */
    createSale: combineResolvers(isAuthenticated, async (_, args, context) => {
      try {
        const { input } = args;
        const { email } = context;
        const user = await User.findOne({ email });
        const sale = new Sale({ ...input, user: user.id });
        const result = await sale.save();
        user.sales.push(result.id); // sale id
        await user.save();
        return result;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error);
        throw error;
      }
    }),
    /**
     * Updates a sale owned by the authenticated user.
     */
    updateSale: combineResolvers(isAuthenticated, isSaleOwner, async (_, args) => {
      try {
        const { id, input } = args;
        const task = await Sale.findByIdAndUpdate(id, { ...input }, { new: true });
        return task;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error);
        throw error;
      }
    }),
    /**
     * Deletes a saled owned by the authenticated user.
     */
    deleteSale: combineResolvers(isAuthenticated, isSaleOwner, async (_, args, context) => {
      try {
        const { id } = args;
        const { loggedInUserId } = context;
        const sale = await Sale.findByIdAndDelete(id);

        // delete sales by user too
        await User.updateOne({ _id: loggedInUserId }, { $pull: { sales: sale.id } });
        return sale;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error);
        throw error;
      }
    }),
  },
  // field level resolvers
  Sale: {
    user: async (parent, args, context) => {
      try {
        const { loaders } = context;
        const user = await loaders.user.load(parent.user.toString());
        return user;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error);
        throw error;
      }
    },
  },
};
