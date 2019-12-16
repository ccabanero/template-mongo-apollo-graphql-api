const { GraphQLDateTime } = require('graphql-iso-date');

const userResolver = require('./user');
const saleResolver = require('./sale');

const customDateScalarResolver = {
  Date: GraphQLDateTime,
};

module.exports = [
  userResolver,
  saleResolver,
  customDateScalarResolver,
];
