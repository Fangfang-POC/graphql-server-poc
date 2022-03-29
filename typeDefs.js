const typeDefs = /* GraphQL */ `
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
    age: Int
  }
  
  type Human {
    name: String
    age: Int
  }
  type Dog {
    gender: String
    age: Int
    weight: Int
  }
  type Cat {
    gender: String
    name: String
    length: Int
  }
  union SearchResult = Human | Dog | Cat

  interface Vehicle {
    maxSpeed: Int
  }
  
  type Airplane implements Vehicle {
    maxSpeed: Int
    wingspan: Int
  }
  
  type Car implements Vehicle {
    maxSpeed: Int
    licensePlate: String
  }
  
  input AddUserInput {
    name: String
    age: Int
  }

  type Query {
    rebels(id: ID!): Faction
    empire: Faction
    node(id: ID!): Node
    user(id: ID!): User
    search: [SearchResult]
    vehicles: [Vehicle]
  }

  type Mutation {
    addUser(input: AddUserInput): User
  }

`;
// export default typeDefs;
module.exports = typeDefs;
