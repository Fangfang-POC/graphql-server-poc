var express = require('express');
var cors = require('cors');
var { graphqlHTTP } = require('express-graphql');
var { buildSchema } = require('graphql');
// var graphqlSchema = require('./schema.graphql');
// console.log(graphqlSchema);

// Construct a schema, using GraphQL schema language
var schema = buildSchema(`
interface Node {
  id: ID!
}

type Faction implements Node {
  id: ID!
  name: String
  ships: ShipConnection
}

type Ship implements Node {
  id: ID!
  name: String
}

type ShipConnection {
  edges: [ShipEdge]
  pageInfo: PageInfo!
}

type ShipEdge {
  cursor: String!
  node: Ship
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}
type User {
  id: ID!
  name: String
}

type Query {
  rebels(id: ID!): Faction
  empire: Faction
  node(id: ID!): Node
  user(id: ID!): User
}`);

// The root provides a resolver function for each API endpoint
var root = {
  rebels: ({id}) => {
    console.log(id);
    return {
      id: id,
      name: 'Han Solo',
      ships: {
        edges: [{
          cursor: 'cursor:1',
          node: {
            id: '1',
            name: 'X-Wing',
          }
        }, {
          cursor: 'cursor:2',
          node: {
            id: '2',
            name: 'Y-Wing',
          }
        }],
        pageInfo: {
          hasNextPage: true,
          hasPreviousPage: false,
          startCursor: 'cursor:1',
          endCursor: 'cursor:2',
        }
      }
    };
  },
  user: ({id}) => ({
    id: id,
    name: `Luke Skywalker ${id}`,
  }),
};

var app = express();
app.use('/graphql', cors(), graphqlHTTP((request, response, params) => {
  // response.headers['Access-Control-Allow-Origin'] = '*';
  // response.headers['Access-Control-Allow-Headers'] = 'Origin, Content-Type, Accept';
  // response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS';
  return ({
    schema: schema,
    rootValue: root,
    graphiql: true,
  });
}
));

app.listen(4000);
console.log('Running a GraphQL API server at http://localhost:4000/graphql');