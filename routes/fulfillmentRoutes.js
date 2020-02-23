const { WebhookClient } = require("dialogflow-fulfillment");
const mongoose = require("mongoose");

const Demand = mongoose.model("demand");
const Coupon = mongoose.model("coupon");

module.exports = app => {
  app.post("/", async (req, res) => {
    const agent = new WebhookClient({ request: req, response: res });

    async function clothing(agent) {
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

      let responseText = `You want to see ${agent.parameters.clothing}. Here is a link to all of our clothing: INSERT SITE HERE`;

      let coupon = await Coupon.findOne({
        clothing: agent.parameters.clothing
      });
      if (coupon !== null) {
        responseText = `You want to see ${agent.parameters.clothing}. Here is a link to all of our clothing: INSERT SITE HERE. And here is a coupon code for chatting with me ${coupon.link}`;
      }
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
