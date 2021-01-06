const { gql } = require("apollo-server");

module.exports = gql`
  type User {
    username: String!
    email: String!
    token: String!
    createdat: String!
  }
  type Message {
    uuid: String!
    sender: String!
    recipient: String!
    content: String!
    createdat: String!
  }
  type Subscription {
    newMessage: Message!
  }
  type Query {
    getUsers: [User]!
    login(username: String!, password: String!): User!
    getMessage(username: String!): [Message]!
  }
  type Mutation {
    register(
      username: String!
      email: String!
      password: String!
      confirmPassword: String!
    ): User!
    sendMessage(recipient: String!, content: String!): Message!
  }
`;
