const { ApolloServer, gql } = require('apollo-server');
const resolvers = require('./resolvers');
const typeDefs = gql(require('./typeDefs'));

async function startApolloServer(typeDefs, resolvers, introspection = false) {
    const server = new ApolloServer({
        cors: true,
        typeDefs,
        resolvers,
        introspection,
    });
    const { url } = await server.listen(4000);
    console.log(`🚀  Server ready at ${url}`);
}

const server = startApolloServer(typeDefs, resolvers, true);
