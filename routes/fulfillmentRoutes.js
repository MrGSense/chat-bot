const { WebhookClient } = require("dialogflow-fulfillment");
const mongoose = require("mongoose");

const Demand = mongoose.model("demand");

module.exports = app => {
  app.post("/", async (req, res) => {
    const agent = new WebhookClient({ request: req, response: res });

    function clothing(agent) {
      Demand.findOne({ clothing: agent.parameters.clothing }, function(
        err,
        clothing
      ) {
        if (clothing !== null) {
          clothing.counter++;
          clothing.save();
        } else {
          const demand = new Demand({ clothing: agent.parameters.clothing });
          demand.save();
        }
      });

      let responseText = `You want to see ${agent.parameters.courses}. Here is a link to all of our clothing: INSERT SITE HERE`;
      agent.add(responseText);
    }

    function fallback(agent) {
      agent.add(`I didn't understand.`);
      agent.add(`I'm sorry, can you try again?`);
    }

    let intentMap = new Map();

    intentMap.set("Get Clothing", clothing);
    intentMap.set("Default Fallback Intent", fallback);

    agent.handleRequest(intentMap);
  });
};
