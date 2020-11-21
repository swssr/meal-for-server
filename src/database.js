/* eslint-disable no-console */
const faunadb = require("faunadb");

const q = faunadb.query;
const client = new faunadb.Client({ secret: "YOUR_FAUNADB_SECRET" });

client.query(q.Get(q.Collection("spells"))).then((ret) => console.log(ret));
