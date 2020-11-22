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

const { PaymentService } = require("./services");

const app = express();

/* eslint-disable no-console */
const faunadb = require("faunadb");
const { urlencoded, json } = require("express");

// const {
//   Collection,
//   Ref,
//   Get,
//   Map,
//   Lambda,
//   Paginate,
//   Var,
//   Match,
//   Index,
// } = faunadb.query;
// const client = new faunadb.Client({ secret: process.env.FAUNA_KEY });

app.use(morgan("dev"));
app.use(helmet());
app.use(cors());
app.use(urlencoded({ extended: false }));
app.use(express.json());

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioClient = require("twilio")(accountSid, authToken);

app.get("/", (req, res) => {
  res.json({
    message: "Hello from server!",
  });
});

app.get("/expressPay", async (req, res) => {
  SendSMS("Hello world!");
});

app.post("/sms", (req, res) => {
  const twiml = new MessagingResponse();

  twiml.message("The Robots are coming! Head for the hills!");

  res.writeHead(200, { "Content-Type": "text/xml" });
  res.end(twiml.toString());
});

app.get("/menu", async (req, res) => {
  const menu = [
    {
      name: "Call Me Brunch",
      img:
        "https://res.cloudinary.com/swssr/image/upload/v1604919303/tablefor/trq7ue8esyflkcbvozfj.png",
      description: "Golden toast with banana berries.",
      price: 70.0,
    },
    {
      name: "Grilled Fish, Veggies",
      img:
        "https://res.cloudinary.com/swssr/image/upload/v1604919460/tablefor/ggl6gzokjnyioyb8gm7n.png",
      description: "Golden toast with banana berries.",
      price: 80.0,
    },
  ];

  try {
    // const menu = await client.query(Get(Collection("menu")));
    // const menu = await Map(
    //   Paginate(Match(Index("all_depts"))),
    //   Lambda("X", Get(Var("X")))
    // );
    // res.json({ menu });
    res.json(menu);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

app.get("/urlPay", handleExternalPayment);
// app.get("/urlPay", urlPayPostManCopy);
app.get("/pay", generatePayUrl);
app.post("/pay", generatePayUrl);

/**
 * OZOW API SHOULD HIT EITHER OF THESE ROUTES ON SUCCESS
 *
 */

app.get("/notify", (req, res) => {
  // eslint-disable-next-line no-console
  console.log(JSON.stringify({ req, res }));

  return res.status(200).json({ req, res });
});

app.get("/donate", urlPayPostManCopy);

app.post("/notify", (req, res) => {
  // eslint-disable-next-line no-console
  console.log(JSON.stringify({ req, res }));
  return res.status(200).json({ req, res });
});

/** END - NOTIFY */

app.use("/api/v1", api);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

async function urlPayPostManCopy(req, res) {
  var data = JSON.stringify({
    SiteCode: "GOR-GOR-003",
    CountryCode: "ZA",
    CurrencyCode: "ZAR",
    Amount: "20.00",
    TransactionReference: "MealFor-Ref",
    BankReference: "MealFor Donation",
    Optional1: "1",
    Optional2: "2",
    Optional3: "3",
    Optional4: "4",
    Optional5: "5",
    Customer: "Donor",
    CancelUrl: "https://hub.vercel.app/cancel",
    ErrorUrl: "https://hub.vercel.app/error",
    SuccessUrl: "https://hub.vercel.app/success",
    NotifyUrl: "https://meal-for.nw.r.appspot.com/notify",
    IsTest: "false",
    PrivateKey: "PApThuCfhweIWRgbfwAaDYVk6vZcJZKV",
    HashCheck:
      "576C5B579787143B2980B5F98311770CBBBCA28DB0D8F0649015BF24853338E2D22FD9013F0B2DAFD5CBE564150EDF6330121B6C503133B79B876E472EC54943",
  });

  var config = {
    method: "post",
    url: "https://i-pay.co.za/api/MerchantApiV1/PostPaymentRequest",
    headers: {
      Accept: "application/json",
      Host: "i-pay.co.za",
      ApiKey: "nscbbbBmVuhu0ZGObWgZTJpoPxgCaGVu",
      "Content-Type": "application/json",
      Cookie: "__cfduid=d0d80c1a72d7de916e51bd684b46967b81605910926",
    },
    data: data,
  };

  await Axios(config)
    .then(function (response) {
      console.log(JSON.stringify(response.data));
      SendSMS(
        `You are the solution to the problem of hunger to this world. Human kindly donate R20 for those who are less fortunate to afford a meal for the day. MealFor Thanks you. \n Click here ${response.data.Url}`
      );
      res.send(response.data.Url);
    })
    .catch(function (error) {
      console.log(error);
      res.send("Bad!");
    });
}

async function handleExternalPayment(req, res) {
  const body = req.body || {};

  const payload = {
    SiteCode: "TSTSTE0001",
    CountryCode: "ZA",
    CurrencyCode: "ZAR",
    Amount: "20.00",
    TransactionReference: "Test1",
    BankReference: "Test1",
    Optional1: "1",
    Optional2: "2",
    Optional3: "3",
    Optional4: "4",
    Optional5: "5",
    Customer: "Customer",
    CancelUrl: "https://hub.tablefor.app/cancel",
    ErrorUrl: "https://hub.tablefor.app/error",
    SuccessUrl: "https://hub.tablefor.app/success",
    NotifyUrl: "https://hub.tablefor.app/cancel",
    PrivateKey: "215114531AFF7134A94C88CEEA48E",
    IsTest: "true",
  };

  const concat = Object.values(payload).join("") + process.env.OZOW_PK;

  const hash = crypto.createHash("sha512");
  const data = hash.update(concat.toLowerCase(), "utf-8");
  const HashCheck = data.digest("hex");

  payload.HashCheck = HashCheck;

  res.send(concat.toLowerCase());
  return console.log(payload);

  const url = "https://i-pay.co.za/api/MerchantApiV1/PostPaymentRequest";

  var config = {
    method: "post",
    url,
    headers: {
      Accept: "application/json",
      Host: "i-pay.co.za",
      ApiKey: "EB5758F2C3B4DF3FF4F2669D5FF5B",
      "Content-Type": "application/json",
    },
    data: JSON.stringify(payload),
  };

  Axios(config)
    .then(function (response) {
      console.log(JSON.stringify(response.data));
      res.status(500).send(JSON.stringify(response));
    })
    .catch((err) => {
      res.status(500).send(JSON.stringify(err));
    });
}

async function generatePayUrl(req, res) {
  // return console.log(req.body) && res.send(req.body);
  var payload = {
    SiteCode: "GOR-GOR-003",
    CountryCode: "ZA",
    CurrencyCode: "ZAR",
    Amount: "20.00",
    TransactionReference: "MealFor-Ref",
    BankReference: "MealFor Payment",
    Optional1: "1",
    Optional2: "2",
    Optional3: "3",
    Optional4: "4",
    Optional5: "5",
    Customer: "Customer",
    CancelUrl: "https://hub.vercel.app/cancel",
    ErrorUrl: "https://hub.vercel.app/error",
    SuccessUrl: "https://hub.vercel.app/success",
    NotifyUrl: "https://meal-for.nw.r.appspot.com/notify",
    IsTest: "false",
    ...req.body,
    PrivateKey: "PApThuCfhweIWRgbfwAaDYVk6vZcJZKV",
  };

  const concatLowerCaseString = Object.values(payload)
    .join("")
    .trim()
    .toLowerCase();
  const hash = crypto.createHash("sha512");
  const _data = hash.update(concatLowerCaseString, "utf-8");
  const ENC = _data.digest("hex");

  payload.HashCheck = ENC.toUpperCase();

  var config = {
    method: "post",
    url: "https://i-pay.co.za/api/MerchantApiV1/PostPaymentRequest",
    headers: {
      Accept: "application/json",
      Host: "i-pay.co.za",
      ApiKey: "nscbbbBmVuhu0ZGObWgZTJpoPxgCaGVu",
      "Content-Type": "application/json",
      Cookie: "__cfduid=d0d80c1a72d7de916e51bd684b46967b81605910926",
    },
    data: JSON.stringify(payload),
  };

  try {
    console.log("TRYING TO POST TO IPAY");
    return await Axios(config).then(async (response) => {
      console.log("SUCCESS");

      console.log(JSON.stringify(response.data));
      await SendSMS(
        `We've received your order, if you want to pay later use this link.\n${response.data.Url}`
      );
      res.send(response.data.Url);
    });
  } catch (err) {
    console.log("FAILED");
    console.log(err);
    return res.status(500).send(err);
  }
}

async function SendSMS(body, number = "+27794701191") {
  await twilioClient.messages
    .create({
      body:
        body ||
        "This is the ship that made the Kessel Run in fourteen parsecs?",
      from: "+12393449069",
      to: `${number}`,
    })
    .then(console.log)
    .catch(console.error);
}

module.exports = app;
