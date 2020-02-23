const express = require("express");
const config = require("./config/keys");
const mongoose = require("mongoose");

const app = express();

app.use(express.json());

mongoose.connect(config.mongoURI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true
});

require("./models/Registration");

require("./routes/diaglogFlowRoutes")(app);
require("./routes/fulfillmentRoutes")(app);

const port = process.env.PORT || 5000;

app.listen(port);
