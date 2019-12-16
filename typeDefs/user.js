const { gql } = require('apollo-server-express');

module.exports = gql`
  extend type Query {
    user: User
  }

  extend type Mutation {
    signup(input: signupInput): User
    login(input: loginInput): Token
  }

  extend type Subscription {
    userCreated: User
  }

  input signupInput {
    firstName: String!
    lastName: String!
    email: String!
    password: String!
  }

  input loginInput {
    email: String!
    password: String!
  }

  type Token {
    token: String!
  }

  type User {
    id: ID!
    firstName: String!
    lastName: String!
    email: String!
    sales: [Sale!]
    isAdmin: Boolean!
    createdAt: Date!
    updatedAt: Date!
  }
`;
