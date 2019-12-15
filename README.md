# GraphQL Server for PNA Garage Sale

## Technology Stack

* Node/Express
* GraphQL with Apollo Server - apollo-server-express
* Mongoose - ODM
* MongoDB - NoSQL

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
