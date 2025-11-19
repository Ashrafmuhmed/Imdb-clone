const dotenv = require("dotenv");
const express = require("express");
const bodyParser = require("body-parser");

const testRoute = require("./routes/test.route");

dotenv.config();

const PORT = process.env.PORT;
const app = express();
app.use(bodyParser.json());

app.use(testRoute);

app.listen(PORT || 3000);
