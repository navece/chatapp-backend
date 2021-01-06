const { PrismaClient } = require("@prisma/client");

const bcrypt = require("bcrypt");

const {
  UserInputError,
  AuthenticationError,
  withFilter,
  PubSub,
} = require("apollo-server");

const jwt = require("jsonwebtoken");

const {
  registerValidation,
  loginValidation,
} = require("../validators/validators");

const prisma = new PrismaClient();
const pubsub = new PubSub();

const NEW_MESSAGE = "NEW_MESSAGE";

module.exports = {
  Subscription: {
    newMessage: {
      // Additional event labels can be passed to asyncIterator creation
      subscribe: withFilter(
        () => pubsub.asyncIterator([NEW_MESSAGE]),
        ({ newMessage }, _, { user }) => {
          console.log(newMessage, user);
          if (
            newMessage.sender === user.username ||
            newMessage.recipient === user.username
          )
            return true;
          else return false;
        }
      ),
    },
  },
  Query: {
    getUsers: async (_, __, context) => {
      try {
        if (!context.user) throw new AuthenticationError("UnAuthenticated");
        const users = await prisma.users.findMany({
          where: { NOT: { username: context.user.username } },
        });
        return users;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
    login: async (_, args) => {
      let { username, password } = args;
      try {
        const user = await prisma.users.findUnique({
          where: { username },
        });
        const { errors, valid } = await loginValidation(user, password);
        if (!valid) throw errors;
        //TODO: authentication token
        const token = jwt.sign({ username }, "black", { expiresIn: "1d" });
        user.token = token;
        //TODO: return user
        return user;
      } catch (err) {
        console.log(err);
        throw new UserInputError("Authentication Failed", { errors: err });
      }
    },
    getMessage: async (_, args, context) => {
      try {
        if (!context.user) throw new AuthenticationError("UnAuthenticated");
        const him = args.username;
        const me = context.user.username;
        const message = await prisma.message.findMany({
          where: {
            OR: [
              { sender: me, recipient: him },
              { sender: him, recipient: me },
            ],
          },
          orderBy: { createdat: "desc" },
        });
        if (!message) throw new UserInputError("No Messages Found");
        return message;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
  },
  Mutation: {
    register: async (_, args) => {
      let { username, email, password, confirmPassword } = args;
      try {
        // TODO: Check if username / email exists
        const userByUsername = await prisma.users.findUnique({
          where: { username },
        });
        const userByEmail = await prisma.users.findUnique({ where: { email } });
        const { errors, valid } = await registerValidation(
          userByEmail,
          userByUsername,
          email,
          username,
          password,
          confirmPassword
        );
        if (!valid) {
          throw errors;
        }
        //Hash password
        password = await bcrypt.hash(password, 6);
        // TODO: Create user
        const user = await prisma.users.create({
          data: {
            username: username,
            email: email,
            password: password,
          },
        });
        // TODO: Return user
        return user;
      } catch (err) {
        console.log(err);
        throw new UserInputError("Bad Input", { errors: err });
      }
    },
    sendMessage: async (_, args, context) => {
      const { recipient, content } = args;
      try {
        const recipientByUsername = await prisma.users.findUnique({
          where: { username: recipient },
        });
        if (!context.user) throw new AuthenticationError("UnAuthenticated");
        if (!recipientByUsername)
          throw new UserInputError("Recipient not found");
        if (context.user.username === recipient)
          throw new UserInputError("Cannot send message to himself");
        const message = await prisma.message.create({
          data: {
            sender: context.user.username,
            recipient: recipient,
            content: content,
          },
        });
        pubsub.publish(NEW_MESSAGE, { newMessage: message });
        return message;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
  },
};
