# GraphQL API Template

## Summary

This is a template repository for starting a new GraphQL API using GitHub's ['Create a repository from a template'](https://help.github.com/en/github/creating-cloning-and-archiving-repositories/creating-a-repository-from-a-template) workflow. This API uses the following technology stack:

![screenshot](./docs/stack.png)

* The authentication strategy uses [JSON Web Token](https://www.npmjs.com/package/jsonwebtoken) (JWT).
* The app is written using [Node.js](https://nodejs.org/en/) and the [Express](https://expressjs.com) Web framework.
* [Apollo Server Express](https://github.com/apollographql/apollo-server/tree/master/packages/apollo-server-express) is used as the GraphQL Server.
* [Mongoose](https://mongoosejs.com) is used as the Object document model (ODM) when interfacing with the database.
* [MongoDB](https://www.mongodb.com) is the NoSQL database.


Note, while this repo uses Express, Apollo Server can utilize other Node.js frameworks (e.g. Hapi, KOA).  See [here](https://www.apollographql.com/docs/apollo-server/v1/).

## Features

The quickest way to evaluate features is to open the GraphQL Playground after you run the app (http://localhost:3001/graphql) and evaluate the docs and schema.

![screenshot](./docs/graphql_playground.png)

Below is a brief summary of the capabilities of the GraphQL API starter:

|  Type | Name  | General Description  |     
|---|---|---|
|  Mutation | signup  			| UnAuthenticated User can sign up.  |   
|  Mutation | login   			| UnAuthenticated User can login (if signed up, responds with a JWT token).  |  
|  Query    | getUser 			| Authenticated User can get user info (about themselves). |
|  Mutation | createSale 		| Authenticated User can create a sale. *The Sale object was included as it may be useful to understand user and object relations.  Drop if not needed. |
|  Mutation | updateSale 		| Authenticated User can update a sale (they own).  |
|  Mutation | deleteSale 		| Authenticated User can delete a sale (then own). | 
|  Query    | getSales(skip:,limit:)  | UnAuthenticated User can read all sales. |
|  Query    | getSale | UnAuthenticated User can read sale details for provided sale id. |
|  Subscription | userCreated | Event for when a new User is signed up. |   
|  Subscription | saleCreated | Event for when a new Sale is created by an authenticated user. |

Below are [snippets](./docs/snippets.md) for executing various queries, mutations, and subscriptions in the GraphQL Playground.

## Using this Template

__Step 1__. On this repo page, choose __Use this template__.

  * Enter new repository name.
  * Enter description.
  * Declare Public or Private
  * Choose __Create repository from template__.
  * Clone the new repository created using the template.
  * Install dependencies with:

````
npm install
````

__Step 2__. Stand up a MongoDB database.

GraphQL Playground

1. Open chrome and launch use the GraphQL Playground as a client to the graphql api: http://localhost:3001/graphql
2. Login
3. Declare HTTP Headers such as:

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

* If you are running a local/dev MongoDB then run it via Terminal. For example, based on how I installed MongoDB for local development, I run it with:

````
/Users/clintcabanero/mongodb/bin/mongod --dbpath=/Users/clintcabanero/mongodb-data
````

__Step 3__. Open the project in VS Code. Add an .env file to the root of the Node app for connecting to your MongoDB.

.env

````
PORT=3001
MONGO_DB_URL=mongodb://your-database-url-here:27017/your-name-here-graphql
JWT_SECRET_KEY=your-secret-key-here
````

__Step 4__. Run the app.

````
npm run dev
````
__Step 5__. Run the unit and integration tests.

TO-DO

````
npm run test
````


