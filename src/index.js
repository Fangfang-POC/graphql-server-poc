const {ApolloServer, gql} = require('apollo-server');
const resolvers = require('./resolvers');
const typeDefs = gql(require('./typeDefs'));

// const books = [
//     {
//       title: 'The Awakening',
//       author: 'Kate Chopin',
//     },
//     {
//       title: 'City of Glass',
//       author: 'Paul Auster',
//     },
//   ];
  
//   // Schema definition
//   const typeDefs = gql`
//     type Book {
//       title: String
//       author: String
//     }
  
//     type Query {
//       books: [Book]
//     }
//   `;
  
//   // Resolver map
//   const resolvers = {
//     Query: {
//       books() {
//         return books;
//       }
//     },
//   };
  
async function startApolloServer(typeDefs, resolvers, introspection = false) {
    const server = new ApolloServer({
        cors: true,
        typeDefs,
        resolvers,
        introspection,
    });
    const {url} = await server.listen(4000);
    console.log(`🚀  Server ready at ${url}`);
}

const server = startApolloServer(typeDefs, resolvers);
