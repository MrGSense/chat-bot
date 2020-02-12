const dialogflow = require("dialogflow");
const config = require("../config/keys");

const sessionClient = new dialogflow.SessionsClient();

const sessionPath = sessionClient.sessionPath(
  config.googleProjectID,
  config.dialogFlowSessionID
);

module.exports = app => {
  app.post("/api/df_text_query", (req, res) => {
    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: request.body.text,
          languageCode: config.dialogFlowSessionLanguageCode
        }
      }
    };
  });

  app.post("/api/df_event_query", (req, res) => {
    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: request.body.text,
          languageCode: config.dialogFlowSessionLanguageCode
        }
      }
    };
  });
};
