const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();

const auth = require("./routes/auth");
const test = require("./routes/test");
const public = require("./routes/public");

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER_NAME}:${process.env.DB_USER_PASS}@cluster0.mj1ib.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`,
    { useNewUrlParser: true },
    { useUnifiedTopology: true }
  )
  .then(() => console.log("Monogo is running"))
  .catch((error) => console.log("Error while connecting to atlas", error));
app.use(express.static(__dirname + "./uploads"));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/auth", auth);
app.use("/public", public);
app.use("/test", test);

const port = process.env.PORT || 3001;

if (process.env.NODE_ENV == "production") {
  app.use(express.static("client/build"));
}
app.listen(port, () => {
  console.log(`Listening to port ${port}...`);
});
