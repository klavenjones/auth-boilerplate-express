const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cookierParser = require("cookie-parser");
const cors = require("cors");

const path = require("path");
const fs = require("fs");
const https = require("https");

const config = require("./config");

mongoose.Promise = global.Promise;
mongoose.connect(config.DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

var certOptions = {
  key: fs.readFileSync(path.resolve("server/server.key")),
  cert: fs.readFileSync(path.resolve("server/server.crt"))
};

const app = express();

// Middlewares
app.use(cookierParser());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true
  })
);
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(bodyParser.json());

app.use(morgan("dev"));

//Routes
app.use("/users", require("./routes/userRoutes"));

//Starting Server
const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`App listening on Port: ${port}`));
