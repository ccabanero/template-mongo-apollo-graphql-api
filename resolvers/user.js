const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { combineResolvers } = require('graphql-resolvers');

const User = require('../database/models/user');
const Sale = require('../database/models/sale');
const { isAuthenticated } = require('./middleware');
const PubSub = require('../subscription');
const { userEvents } = require('../subscription/events');

module.exports = {
  // query resolver
  Query: {
    user: combineResolvers(isAuthenticated, async (parent, args, context) => {
      try {
        const { email } = context;
        const user = await User.findOne({ email });
        if (!user) {
          throw new Error('User not found!');
        }
        return user;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error);
        throw error;
      }
    }),
  },
  // mutation resolver
  Mutation: {
    signup: async (parent, args) => {
      try {
        const { input } = args;
        const user = await User.findOne({ email: input.email });
        if (user) {
          throw new Error('Email already in use');
        }
        const hashedPassword = await bcrypt.hash(input.password, 12);
        const newUser = new User({ ...input, password: hashedPassword });
        const result = await newUser.save();

        // publish an event for created user
        PubSub.publish(userEvents.USER_CREATED, {
          userCreated: result,
        });

        return result;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error);
        throw error;
      }
    },
    login: async (_, args) => {
      try {
        const { input } = args;
        const user = await User.findOne({ email: input.email });
        if (!user) {
          throw new Error('Invalid credentials');
        }
        const isPasswordValid = await bcrypt.compare(input.password, user.password);
        if (!isPasswordValid) {
          throw new Error('Invalid credentials');
        }
        const secret = process.env.JWT_SECRET_KEY || 'mysecret';
        const token = jwt.sign({ email: user.email }, secret, { expiresIn: '1d' });
        return {
          token,
        };
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error);
        throw error;
      }
    },
  },
  // subscription resolver
  Subscription: {
    userCreated: {
      subscribe: () => PubSub.asyncIterator(userEvents.USER_CREATED),
    },
  },
  // field level resolvers
  User: {
    sales: async (parent) => {
      try {
        const { id } = parent;
        const tasks = await Sale.find({ user: id });
        return tasks;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error);
        throw error;
      }
    },
  },
};
