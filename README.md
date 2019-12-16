# GraphQL Server for PNA Garage Sale

## Technology Stack

* [Node.js](https://nodejs.org/en/)
* [Express](https://expressjs.com) - Web framework
* [Apollo Server Express](https://github.com/apollographql/apollo-server/tree/master/packages/apollo-server-express) - GraphQL Server
* [MongoDB](https://www.mongodb.com) - NoSQL database
* [Mongoose](https://mongoosejs.com) - MongoDB object modeling

Pre-requisite: MongoDB running on your Mac.  Also Robot 3T client for MongoDB.

It should be mentioned, that this repo uses MongoDB.  Apollo Server is not opinionated on the DB.  For example, all of this can connect to PostgreSQL or AWS Lambda/DynamoDB.

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

PNA garage sale owners:

* User can register their garage sale.
* User can view the garage sale they own.
* User can edit the garage sale they own.
* User can upload images for their garage sale.

Admin Users:

* Can view garage sales.
* Can edit garage sales.
* Can delete a garage sale.


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

See database/models/user.js

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

See database/models/sale.js

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
  date: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model('Sale', saleSchema);


````

The /database/utils/inedex.js is used to connect the Node/Express app a MongoDB instance.

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
    await verifyUser(req);
    return {
      email: req.email,
      loggedInUserId: req.loggedInUserId
    }
  }
});
apolloServer.applyMiddleware({ app, path: '/graphql' });

// port
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server listening on PORT: ${PORT}`);
  console.log(`Graphql Endpoint: ${apolloServer.graphqlPath}`)
});

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

Running the app
When you want to run the app you now do ...

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

  extend type Subscription {
    userCreated: User
  }
`;

````

Create /typeDefs/sale.js

````
const { gql } = require('apollo-server-express');

module.exports = gql`
  extend type Query {
    sales(skip: Int, limit: Int): [Sale!]
    sale(id: ID!): Sale
  }

  extend type Mutation {
    createSale(input: createSaleInput!): Sale
    updateSale(id: ID!, input: updateSaleInput!): Sale
    deleteSale(id: ID!): Sale
  }

  input createSaleInput {
    address: String!
    latitude: Number!
    longitude: Number!
    type: String!
    categories: [String!]
    desc: String!
    date: Date!
    createdAt: Date!
    updatedAt: Date!
  }

  input updateSaleInput {
    address: String!
    latitude: Number!
    longitude: Number!
    type: String!
    categories: [String!]
    desc: String!
    date: Date!
    createdAt: Date!
    updatedAt: Date!
  }

  type Sale {
    address: String!
    latitude: Number!
    longitude: Number!
    type: String!
    categories: [String!]
    desc: String!
    date: Date!
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
    signup: async (_, args) => {
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
const { isAuthenticated, isTaskOwner } = require('./middleware');

module.exports = {
  // query resolver
  Query: {
    sales: combineResolvers(isAuthenticated, async (parent, args, context) => {
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
    sale: combineResolvers(isAuthenticated, isTaskOwner, async (_, args) => {
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
  // mutation resolver
  Mutation: {
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
    updateSale: combineResolvers(isAuthenticated, isTaskOwner, async (_, args) => {
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
    deleteSale: combineResolvers(isAuthenticated, isTaskOwner, async (_, args, context) => {
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

````

## Subscriptions

## GraphQL Playgrounds

Sign up:

````
mutation signup {
  signup(
    input: {
      firstName: "Clint"
      lastName: "Cabanero"
      email: "clint@gmail.com"
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
  login(input: { email: "clint@gmail.com", password: "123456" }) {
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

Get Sale: 

````
query getSale {
  sale(id: "5df6f990157d658b5adf37fb") {
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
  deleteSale(id:"5df6f990157d658b5adf37fb") {
    address
  }
}
````

Subscribe to user created


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
