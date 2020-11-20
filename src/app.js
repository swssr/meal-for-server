const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");

require("dotenv").config();

const middlewares = require("./middlewares");
const api = require("./api");
const { default: Axios } = require("axios");

const app = express();

app.use(morgan("dev"));
app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Hello from server!",
  });
});

app.get("/menu", (req, res) => {
  const menu = [
    {
      name: "Call Me Brunch",
      img:
        "https://res.cloudinary.com/swssr/image/upload/v1604919303/tablefor/trq7ue8esyflkcbvozfj.png",
      description: "Golden toast with banana berries.",
    },
    {
      name: "Grilled Fish, Veggies",
      img:
        "https://res.cloudinary.com/swssr/image/upload/v1604919460/tablefor/ggl6gzokjnyioyb8gm7n.png",
      description: "Golden toast with banana berries.",
    },
  ];
  res.json(menu);
});

app.post("/pay", async (req, res) => {
  // const payload = req.body || {
  const payload = {
    SiteCode: "TSTSTE0001",
    CountryCode: "ZA",
    CurrencyCode: "ZAR",
    Amount: 10.0,
    TransactionReference: "12345",
    // BankReference: "12345",
    IsTest: true,
    privateKey: "215114531AFF7134A94C88CEEA48E",
    NotifyUrl: "https://meal-for.nw.r.appspot.com/notify",
  };

  const HashCheck = Object.values(payload).join("");

  payload.HashCheck = HashCheck;

  await Axios.post("https://pay.ozow.com/", payload, {
    params: payload,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  })
    .then((res) => {
      console.log(JSON.stringify(res));
      res.status(200).json(res);
    })
    .catch((err) => {
      console.log(JSON.stringify(err));
      res.status(500).json(err);
    });
});

/**
 * OZOW API SHOULD HIT EITHER OF THESE ROUTES ON SUCCESS
 *
 */

app.get("/notify", (req, res) => {
  console.log(JSON.stringify({ req, res }));

  return res.status(200).json({ req, res });
});

app.post("/notify", (req, res) => {
  console.log(JSON.stringify({ req, res }));
  return res.status(200).json({ req, res });
});

/** END - NOTIFY */

app.use("/api/v1", api);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

module.exports = app;
