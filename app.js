const express = require("express");
const graphqlHTTP = require("express-graphql");
const { buildSchema } = require("graphql");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const Event = require("./models/event");
const app = express();

const events = [];

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

    }

    schema{
        query:RootQuery 
        mutation:RootMutation  
    } 

    `),
    rootValue: {
      events: args => {
        return events;
      },
      createEvent: args => {
        // const event = {

        // };
        const event = new Event({
          _id: Math.random().toString(),
          title: args.eventInput.title,
          description: args.eventInput.description,
          price: +args.eventInput.price,
          date: new Date(args.eventInput.date)
        });
        events.push(event);
        return event;
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
