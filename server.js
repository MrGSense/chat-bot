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
require("./models/Demand");
require("./models/Coupons");

require("./routes/diaglogFlowRoutes")(app);
require("./routes/fulfillmentRoutes")(app);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(client / dist));

  const path = require("path");
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "dist", "index.html"));
  });
}

const port = process.env.PORT || 5000;

app.listen(port);
