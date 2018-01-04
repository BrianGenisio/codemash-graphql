const express = require('express');
const graphqlHTTP = require('express-graphql');

const {rootSchema, RootQuery} = require("./schema/root.js");

const app = express();

app.use(express.static('./public'));

app.use('/graphql', graphqlHTTP({
    schema: rootSchema,
    rootValue: new RootQuery(),
    graphiql: true,
}));

app.listen(process.env.PORT ||4000,
    () => console.log('Now browse to localhost:4000/graphql'));
