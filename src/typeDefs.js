const typeDefs = `
directive @uppercase on FIELD_DEFINITION

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
  enum Gender {
    MALE
    FEMALE
  }
  type User {
    id: ID!
    name: String
    username: String @uppercase
    gender: Gender @deprecated(reason: "test directive")
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
  type UsersQueryResult {
    totalCount: Int
    userList: [User]
  }

  type Subscription {
    userAdded: User
  }

  type Query {
    rebels(id: ID!): Faction
    empire: Faction
    node(id: ID!): Node
    users(offset: Int, limit: Int): UsersQueryResult
    user(id: ID!): User
    search: [SearchResult]
    vehicles: [Vehicle]
  }

  type Mutation {
    addUser(input: AddUserInput): User
  }
`;

module.exports = typeDefs;
