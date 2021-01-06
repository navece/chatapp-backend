const { ApolloServer } = require("apollo-server");
const typeDefs = require("./graphql/typeDefs");
const resolvers = require("./graphql/resolvers");
const contextMiddleware = require("./graphql/util/conextMiddleware");

let server = new ApolloServer({
  typeDefs,
  resolvers,
  context: contextMiddleware,
  introspection: true,
  playground: true,
  subscriptions: {
    path: "/subscriptions",
    keepAlive: 1000,
  },
});

server
  .listen({ port: process.env.PORT || 4000 })
  .then(({ url, subscriptionsUrl }) => {
    console.log(`🚀  Server ready at ${url}`);
    console.log(`🚀  Subscriptions ready at ${subscriptionsUrl}`);
  });
