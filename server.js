var express = require('express');
var cors = require('cors');
var { graphqlHTTP } = require('express-graphql');
// var { buildSchema, buildASTSchema, printSchema } = require('graphql');
var { makeExecutableSchema } = require('@graphql-tools/schema');
const resolvers = require('./resolvers');
const typeDefs = require('./typeDefs');

var executableSchema = makeExecutableSchema({
  typeDefs: typeDefs,
  resolvers: resolvers,
});

var app = express();
app.use('/graphql', cors(), graphqlHTTP({
  schema: executableSchema,
  graphiql: process.env.NODE_ENV === 'development',
}));

app.listen(4000);
console.log('Running a GraphQL API server at http://localhost:4000/graphql');