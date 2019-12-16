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
    const { connection } = integrationContext;
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
