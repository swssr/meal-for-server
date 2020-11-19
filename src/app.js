const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");

require("dotenv").config();

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

app.use("/api/v1", api);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

module.exports = app;
