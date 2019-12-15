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

