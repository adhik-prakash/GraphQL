const express = require("express");
const { graphqlHTTP } = require("express-graphql");

let UserList = require("./user.json");
const {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLInt,
  GraphQLList,
  GraphQLSchema,
  GraphQLNonNull,
} = require("graphql");

const app = express();

const port = 8000;

//schema for user
const UserType = new GraphQLObjectType({
  name: "UserType",
  fields: {
    id: {
      type: GraphQLID,
    },
    name: {
      type: GraphQLString,
    },
    email: {
      type: GraphQLString,
    },
    age: {
      type: GraphQLInt,
    },
    message: {
      type: GraphQLString,
    },
  },
});

//query
const query = new GraphQLObjectType({
  name: "query",
  fields: {
    users: {
      type: new GraphQLList(UserType),
      resolve() {
        return UserList;
      },
    },
    user: {
      type: UserType,
      args: {
        id: {
          type: GraphQLID,
        },

        name: {
          type: GraphQLString,
        },
        email: {
          type: GraphQLString,
        },
        age: {
          type: GraphQLInt,
        },
      },
      resolve(parent, args) {
        const userWithId = UserList.find((u) => u.id === parseInt(args.id));
        const userWithName = UserList.find((user) => user.name === args.name);

        if (args?.id) {
          return userWithId;
        } else {
          return userWithName;
        }
      },
    },
  },
});
//mutation
const mutation = new GraphQLObjectType({
  name: "mutation",
  fields: {
    //to add user
    addUser: {
      type: UserType,
      args: {
        name: {
          type: new GraphQLNonNull(GraphQLString),
        },
        email: {
          type: new GraphQLNonNull(GraphQLString),
        },
        age: {
          type: new GraphQLNonNull(GraphQLInt),
        },
      },
      resolve(parent, { name, email, age }) {
        const newUser = {
          name,
          email,
          age,
          id: Date.now().toString(),
        };
        UserList.push(newUser);
        return {
          ...newUser,
          message: "User has been added Suseccfully",
        };
      },
    },
    deleteUser: {
      type: UserType,
      args: {
        id: {
          type: new GraphQLNonNull(GraphQLID),
        },
      },
      resolve(parent, { id }) {
        const deletedUser = UserList.find((user) => user.id === parseInt(id));
        console.log(deletedUser);
        UserList = UserList.filter((user) => user.id !== parseInt(id));
        return {
          ...deletedUser,
          message: "User deleted sucessfully",
        };
      },
    },
    updateUser: {
      type: UserType,
      args: {
        id: {
          type: new GraphQLNonNull(GraphQLID),
        },
        name: {
          type: new GraphQLNonNull(GraphQLString),
        },
        email: {
          type: new GraphQLNonNull(GraphQLString),
        },
        age: {
          type: new GraphQLNonNull(GraphQLInt),
        },
      },
      resolve(parent, { id, name, email, age }) {
        const updatedUser = UserList.find((user) => user.id === parseInt(id));
        // console.log(updatedUser);
        if (updatedUser) {
          updatedUser.name = name;
          updatedUser.email = email;
          updatedUser.age = age;
          updatedUser.id = id;
        }
        return {
          ...updatedUser,
          message: "User has been updated sucessfully",
        };
      },
    },
  },
});

const schema = new GraphQLSchema({
  query,
  mutation,
});

//middleware
app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    graphiql: true,
  })
);

//creating server
app.listen(8000, () => {
  console.log(`listening to the  server at ${port}`);
});
