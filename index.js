const express = require('express');
// const { ApolloServer } = require('apollo-server-express');
const cors = require('cors');
const dotEnv = require('dotenv');

// const typeDefs = require('./typeDefs');
// const resolvers = require('./resolvers');
const { connectToMongoDB } = require('./database/util');
// const { verifyUser } = require('./helper/context');

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

// // apollo server
// const apolloServer = new ApolloServer({
//   typeDefs,
//   resolvers,
//   context: async (integrationContext) => {
//     const { req } = integrationContext;
//     await verifyUser(req);
//     return {
//       email: req.email,
//       loggedInUserId: req.loggedInUserId,
//     };
//   },
// });
// apolloServer.applyMiddleware({ app, path: '/graphql' });

// port
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on PORT: ${PORT}`);
  // eslint-disable-next-line no-console
  // console.log(`Graphql Endpoint: ${apolloServer.graphqlPath}`);
});
