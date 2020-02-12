const express = require("express");

const app = express();

app.use(express.json());

require("./routes/diaglogFlowRoutes")(app);

const port = process.env.PORT || 5000;

app.listen(port);
