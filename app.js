const express = require("express");
const graphqlHTTP = require("express-graphql");
const { buildSchema } = require("graphql");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const Event = require("./models/event");
const User = require("./models/user");
const app = express();

app.use(bodyParser.json());

app.use(
  "/graphql",
  graphqlHTTP({
    schema: buildSchema(`

    type Event{
      _id:ID!
      title:String!
      description:String!
      price:Float!
      date:String!
    }

    type User{
      _id:String!
      email:String!
      password:String
    }

    input UserInput{
      email:String!
      password:String!
    }

    input EventInput{
      title:String!
      description:String!
      price:Float!
      date:String!

   }
    type RootQuery{
      events:[Event]!
      
    },
    type RootMutation{
      createEvent(eventInput:EventInput):Event
      createUser(userInput:UserInput):User

    }

    schema{
        query:RootQuery 
        mutation:RootMutation  
    } 

    `),
    rootValue: {
      events: () => {
        return Event.find()
          .then(events => {
            return events.map(event => {
              return { ...event._doc, _id: event.id };
            });
          })
          .catch(err => {
            throw err;
          });
      },
      createEvent: args => {
        const event = new Event({
          title: args.eventInput.title,
          description: args.eventInput.description,
          price: +args.eventInput.price,
          date: new Date(args.eventInput.date)
        });
        return event
          .save()
          .then(result => {
            console.log(result);
            return { ...result._doc, _id: result.id };
          })
          .catch(err => {
            throw console.error(err);
          });
      },
      createUser: args => {
        const user = new User({
          email: args.userInput.email,
          password: args.userInput.password
        });
        return user
          .save()
          .then()
          .catch(err => {
            throw err;
          });
      }
    },
    graphiql: true
  })
);

const PORT = 5000;

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-sayil.mongodb.net/${process.env.MONGODB_NAME}?retryWrites=true&w=majority`
  )
  .then(
    app.listen(PORT, () => console.log(`Database is connected on port:${PORT}`))
  )
  .catch(err => console.log(err));
