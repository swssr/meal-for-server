/* eslint-disable quotes */
const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
// const sha512 = require("js-sha512");

const crypto = require("crypto");

require("dotenv").config();

const { default: Axios } = require("axios");
const middlewares = require("./middlewares");
const api = require("./api");

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

  console.log("BODY", req.body);
  const payload = {
    SiteCode: "TSTSTE0001",
    CountryCode: "ZA",
    CurrencyCode: "ZAR",
    Amount: 10.0,
    // TransactionReference: "12345",
    IsTest: true,
    privateKey: "215114531AFF7134A94C88CEEA48E",
    // BankReference: "12345",
    // NotifyUrl: "https://meal-for.nw.r.appspot.com/notify",
    // NotifyUrl: "http://locahost:5000/notify",
    ...req.body,
  };

  const HashCheck = Object.values(payload).join("").toLowerCase();

  const hash = crypto.createHash("sha512");
  const data = hash.update(HashCheck, "utf-8");
  const ENC = data.digest("hex");

  payload.HashCheck = ENC;

  // console.log({ ENC });

  const params = new URLSearchParams(payload).toString();

  try {
    await Axios.post(`https://pay.ozow.com/?${params}`).then((_res) => {
      // console.log(_res.data);

      res.set("Content-Type", "text/html");
      res.end(`${_res.data}`);

      // res.status(200).send(_res);
    });
  } catch (err) {
    res.status(500).send(err);
  }
});

/**
 * OZOW API SHOULD HIT EITHER OF THESE ROUTES ON SUCCESS
 *
 */

app.get("/notify", (req, res) => {
  // eslint-disable-next-line no-console
  console.log(JSON.stringify({ req, res }));

  return res.status(200).json({ req, res });
});

app.post("/notify", (req, res) => {
  // eslint-disable-next-line no-console
  console.log(JSON.stringify({ req, res }));
  return res.status(200).json({ req, res });
});

/** END - NOTIFY */

app.use("/api/v1", api);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

module.exports = app;
