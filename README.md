# GraphQL API for PNA Garage Sale

A simple GraphQL API for PNA.

![screenshot](./screenshot/graphql_playground.png)

## Technology Stack

* [Node.js](https://nodejs.org/en/)
* [Express](https://expressjs.com) - Web framework
* [Apollo Server Express](https://github.com/apollographql/apollo-server/tree/master/packages/apollo-server-express) - GraphQL Server
* [MongoDB](https://www.mongodb.com) - NoSQL database
* [Mongoose](https://mongoosejs.com) - MongoDB object modeling


Note, this repo uses Express.  But Apollo Server can play well with other Node.js middleware (e.g. Hapi, KOA).  See [here](https://www.apollographql.com/docs/apollo-server/v1/).

Pre-requisite: MongoDB running on your Mac.  Also Robot 3T client for MongoDB. Note, this repo uses MongoDB.  But Apollo Server is not opinionated what database you use.

## Quickstart

Run MongoDB via Terminal:

````
/Users/clintcabanero/mongodb/bin/mongod --dbpath=/Users/clintcabanero/mongodb-data
````

Run Dev

````
npm run dev
````

Run Tests

````
npm run test
````

GraphQL Playground

1. Login
2. Declare HTTP Headers such as:

````
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImNsaW50OEBnbWFpbC5jb20iLCJpYXQiOjE1NzYzNjAyNDYsImV4cCI6MTU3NjQ0NjY0Nn0.FYYZY1DFd0IVb8xcFLv1AxeghwaBwziEKkUjlBcGTVA"
}
````

## Requirements

This GraphQL API supports the following queries and mutations:

* UnAuthenticated User can sign up (creates a user in User table)
* UnAuthenticated User can login (if signed up, responds with a JWT token)
* Authenticated User can create a sale
* Authenticated User can update a sale (they own)
* Authenticated User can delete a sale (then own)
* Authenticated User can get user info
* UnAuthenticated User can read all sales.
* UnAuthenticated User can read sale details for provided sale id.

This GraphQL Server supports the following subscriptions:

* Event for when a new Sale is created by an authenticated user.
* Event for when a new User is signed up.


## Scaffolding

__Package.json__

Create package.json

````
npm init -y
````

Install stuff

````
npm install express apollo-server-express cors dotenv uuid mongoose bcryptjs graphql-iso-date jsonwebtoken graphql-resolvers dataloader validator
````

__Environment__

Create .env

````
PORT=3001
MONGO_DB_URL=mongodb://localhost/sales

````

__Extensions to VSCode Used__

* ESLint extension to VSCode to enforce AirBNB JavaScript style guide
* Apollo GraphyQL extension to VSCode

## Data Models

This repo uses Mongoose as a ODM on top of MongoDB.  Thus, this section defines the Mongoose data models. 

Create database/models/user.js

````
const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error('Email is invalid');
      }
    },
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: 7,
    validate(value) {
      if (value.toLowerCase().includes('password')) {
        throw new Error('Password cannot contain the word password');
      }
    },
  },
  sales: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sale',
    },
  ],
  isAdmin: {
    type: Boolean,
    required: true,
    default: false,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('User', userSchema);

````

Create database/models/sale.js

````
const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true,
  },
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  categories: [
    {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
  ],
  desc: {
    type: String,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Sale', saleSchema);

````

Create /database/util/index.js

````
const mongoose = require('mongoose');

module.exports.connectToMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB_URL,
      { useNewUrlParser: true, useUnifiedTopology: true });

    // eslint-disable-next-line no-console
    console.log('Database connected successfully');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
    throw error;
  }
};

module.exports.isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

````

## Node App

Create index.js

````
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const cors = require('cors');
const dotEnv = require('dotenv');

const typeDefs = require('./typeDefs');
const resolvers = require('./resolvers');
const { connectToMongoDB } = require('./database/util');
const { verifyUser } = require('./helper/context');

// set env variables
dotEnv.config();

// create express app
const app = express();

// db connectivity
connectToMongoDB();

// cors
app.use(cors());

// body parser middleware
app.use(express.json());

// apollo server
const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: async (integrationContext) => {
    const { req } = integrationContext;
    const contextObj = {};
    if (req) {
      await verifyUser(req);
      contextObj.email = req.email;
      contextObj.loggedInUserId = req.loggedInUserId;
    }
    return contextObj;
  },
});
apolloServer.applyMiddleware({ app, path: '/graphql' });

// port
const PORT = process.env.PORT || 3000;

const httpServer = app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on PORT: ${PORT}`);
  // eslint-disable-next-line no-console
  console.log(`Graphql Endpoint: ${apolloServer.graphqlPath}`);
});

// support for subscriptions
apolloServer.installSubscriptionHandlers(httpServer);

````

__Nodemon__ 

Add nodemon

````
npm install -D nodemon
````

Update package.json to use nodemon

````
...
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  },
...
````

When you want to run the app you now do ...  Note, this won't work yet until you complete the steps below.

````
npm run dev
````

## TypeDefs

Create /typeDefs/index.js.  Note, the approach here uses 'schema sticthing' so that we can abstract user and sale queries, mutations, subscriptions together.

````
const { gql } = require('apollo-server-express');

const userTypeDefs = require('./user');
const saleTypeDefs = require('./sale');

const typeDefs = gql`
  scalar Date
  type Query {
    _: String
  }
  type Mutation {
    _: String
  }
  type Subscription {
    _: String
  }
`;

module.exports = [
  typeDefs,
  userTypeDefs,
  saleTypeDefs,
];

````

Create /typeDefs/user.js

````
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

````

Create /typeDefs/sale.js

````
const { gql } = require('apollo-server-express');

module.exports = gql`
  extend type Query {
    sales(skip: Int, limit: Int): [Sale!]
    saleById(id: ID!): Sale
  }

  extend type Mutation {
    createSale(input: createSaleInput!): Sale
    updateSale(id: ID!, input: updateSaleInput!): Sale
    deleteSale(id: ID!): Sale
  }

  extend type Subscription {
    saleCreated: Sale
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

````

## Resolvers

Create /resolvers/index.js

````
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

````

Create /resolvers/user.js

````
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

````

Create /resolvers/sales.js

````
const { combineResolvers } = require('graphql-resolvers');

// const { users, sales } = require('../constants');
const Sale = require('../database/models/sale');
const User = require('../database/models/user');
const { isAuthenticated, isSaleOwner } = require('./middleware');
const PubSub = require('../subscription');
const { saleEvents } = require('../subscription/events');

module.exports = {
  // query resolvers
  Query: {
    /**
     * Finds all sales.
     */
    sales: async (parent, args) => {
      try {
        const { skip, limit } = args;
        const sales = await Sale.find({})
          .sort({ _id: -1 })
          .skip(skip)
          .limit(limit);
        return sales;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error);
        throw error;
      }
    },
    /**
     * Finds sale by id.
     */
    saleById: async (parent, args) => {
      try {
        const { id } = args;
        const sale = await Sale.findById(id);
        return sale;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error);
        throw error;
      }
    },
  },
  // mutation resolvers
  Mutation: {
    /**
     * Creates a new sale, owned by the authenticated user.
     */
    createSale: combineResolvers(isAuthenticated, async (parent, args, context) => {
      try {
        const { input } = args;
        const { email } = context;
        const user = await User.findOne({ email });
        const sale = new Sale({ ...input, user: user.id });
        const result = await sale.save();

        // publish an event for sale created
        PubSub.publish(saleEvents.SALE_CREATED, {
          saleCreated: result,
        });

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
    updateSale: combineResolvers(isAuthenticated, isSaleOwner, async (parent, args) => {
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
    deleteSale: combineResolvers(isAuthenticated, isSaleOwner, async (parent, args, context) => {
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
  // subscription resolver
  Subscription: {
    saleCreated: {
      subscribe: () => PubSub.asyncIterator(saleEvents.SALE_CREATED),
    },
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

````

Create /resolvers/middleware/index.js

````
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

````

## Subscriptions

Create /subscription/index.js

````
const { PubSub } = require('apollo-server-express');

module.exports = new PubSub();
````

Create /subscription/events/index.js

````
const userEvents = require('./user');
const saleEvents = require('./sale');

module.exports = {
  userEvents,
  saleEvents,
};
````

Create /subscription/events/user.js

````
module.exports = {
  USER_CREATED: 'USER_CREATED',
};

````

Create /subscription/events/sale.js

````
module.exports = {
  SALE_CREATED: 'SALE_CREATED',
};

````

## GraphQL Playgrounds

Playgrounds 101:

* How to view schema
* How to view documentation - and navigate
* How to execute Queries and Mutations with Authentication 
* How to use Subscription

Sign up:

````
mutation signup {
  signup(
    input: {
      firstName: "Johnny"
      lastName: "Appleseed"
      email: "johnnyappleseed@gmail.com"
      password: "123456"
    }
  ) {
    firstName
    lastName
    email
  }
}
````

Log in

````
mutation login {
  login(input: { email: "johnnyappleseed@gmail.com", password: "123456" }) {
    token
  }
}
````

Get User:

````
query getUser {
  user {
    id
    firstName
    lastName
    email
    sales {
      address
      latitude
      longitude
      type
      categories
      desc
      year
      createdAt
      updatedAt
    }
    isAdmin
    createdAt
    updatedAt
  }
}

````

with HTTP headers (replace token):

````
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImNsaW50QGdtYWlsLmNvbSIsImlhdCI6MTU3NjQ2MzYwMywiZXhwIjoxNTc2NTUwMDAzfQ.MQm58KR1flXZOm8o13_npyZy8iQf5ir1agYAe7hkmvs"
}
````

Create Sale:

````
mutation createSale {
  createSale(
    input: {
      address: "1234 12st Avenue WESTMINSTER"
      latitude: 47.65465
      longitude: -122.39658
      type: "Family Sale"
      categories: ["furniture", "clothing", "tools", "books"]
      desc: "Sewing Notions, Bedding, Furniture, Electronics, toys and records."
      year: 2019
    }
  ) {
    id
    address
    latitude
    longitude
    type
    categories
    desc
    year
  }
}
````

Update Sale:

````
mutation updateSale {
  updateSale(
    id: "5df7a5b3c9e1ebb6fa69084a",
    input: {
      address: "3816 31st Avenue West"
      latitude: 47.65465
      longitude: -122.39658
      type: "Family Sale"
      categories: ["furniture", "clothing", "tools", "books"]
      desc: "Sewing Notions, Bedding, Furniture, Electronics, toys and records."
      year: 2019
    }
  ) {
    id
    address
    latitude
    longitude
    type
    categories
    desc
    year
  }
}
````

Delete Sale:

````
mutation deleteSale {
  deleteSale(id: "5df7a5b3c9e1ebb6fa69084a") {
    address
  }
}
````

Get Sales:

````
query getSales {
  sales(skip: 0, limit: 20) {
    id
    address
    latitude
    longitude
    type
    categories
    desc
    year
  }
}
````

Get Sale By Id:

````
query getSaleById {
  saleById(id: "5df7a5b3c9e1ebb6fa69084a") {
    id
    address
    latitude
    longitude
    type
    categories
    desc
    year
  }
}
````

Subscribe to userCreated Event:

````
subscription userCreated {
  userCreated {
    id
    firstName
    lastName
    email
    isAdmin
    createdAt
    updatedAt
  }
}
````

Subscribe to saleCreated Event:

````
subscription saleCreated {
  saleCreated {
    id
    address
    latitude
    longitude
    type
    categories
    desc
    year
    createdAt
    updatedAt
  }
}
````