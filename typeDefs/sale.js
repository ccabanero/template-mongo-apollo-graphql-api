const { gql } = require('apollo-server-express');

module.exports = gql`
  extend type Query {
    salesByOwner(skip: Int, limit: Int): [Sale!]
    saleByOwner(id: ID!): Sale
  }

  extend type Mutation {
    createSale(input: createSaleInput!): Sale
    updateSale(id: ID!, input: updateSaleInput!): Sale
    deleteSale(id: ID!): Sale
  }

  input createSaleInput {
    address: String!
    latitude: Float!
    longitude: Float!
    type: String!
    categories: [String!]
    desc: String!
    year: Int!
  }

  input updateSaleInput {
    address: String!
    latitude: Float!
    longitude: Float!
    type: String!
    categories: [String!]
    desc: String!
    year: Int!
  }

  type Sale {
    id: ID!
    address: String!
    latitude: Float!
    longitude: Float!
    type: String!
    categories: [String!]
    desc: String!
    year: Int!
    user: User!
    createdAt: Date!
    updatedAt: Date!
  }
`;
