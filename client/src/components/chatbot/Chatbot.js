import React, { Component } from "react";
import axios from "axios";
import { withRouter } from "react-router-dom";
import Cookies from "universal-cookie";
import { v4 as uuid } from "uuid";

import Message from "./Message";
import Card from "./Card";
import QuickReplies from "./QuickReplies";

const cookies = new Cookies();

class Chatbot extends Component {
  messagesEnd;
  talkInput;
  constructor(props) {
    super(props);

    this.state = {
      messages: [],
      showBot: true,
      showWelcomeSent: false
    };

    this._handleInputKeyPress = this._handleInputKeyPress.bind(this);
    this._handleQuickReplyPayload = this._handleQuickReplyPayload.bind(this);
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);

    if (cookies.get("userID") === undefined) {
      cookies.set("userID", uuid(), { path: "/" });
    }
  }

  async df_text_query(queryText) {
    let says = {
      speaks: "me",
      msg: {
        text: {
          text: queryText
        }
      }
    };

    this.setState({ messages: [...this.state.messages, says] });

    const res = await axios.post("/api/df_text_query", {
      text: queryText,
      userID: cookies.get("userID")
    });

    for (let msg of res.data.fulfillmentMessages) {
      says = {
        speaks: "bot",
        msg: msg
      };

      this.setState({ messages: [...this.state.messages, says] });
    }
  }

  async df_event_query(eventName) {
    const res = await axios.post("/api/df_event_query", {
      event: eventName,
      userID: cookies.get("userID")
    });

    for (let msg of res.data.fulfillmentMessages) {
      let says = {
        speaks: "bot",
        msg: msg
      };

      this.setState({ messages: [...this.state.messages, says] });
    }
  }

  componentDidMount() {
    this.df_event_query("Welcome");

    if (window.location.pathname === "/shop" && !this.state.shopWelcomeSent) {
      this.df_event_query("WELCOME_SHOP");
      this.setState({ shopWelcomeSent: true });
    }

    this.props.history.listen(() => {
      if (
        this.props.history.location.pathname === "/shop" &&
        !this.state.shopWelcomeSent
      ) {
        this.df_event_query("WELCOME_SHOP");
        this.setState({ shopWelcomeSent: true, showBot: true });
      }
    });
  }

  componentDidUpdate() {
    this.messagesEnd.scrollIntoView({ behavior: "smooth" });
    if (this.talkInput) {
      this.talkInput.focus();
    }
  }

  show(event) {
    event.preventDefault();
    event.stopPropagation();
    this.setState({ showBot: true });
  }

  hide(event) {
    event.preventDefault();
    event.stopPropagation();
    this.setState({ showBot: false });
  }

  renderCards(cards) {
    return cards.map((card, i) => <Card key={i} payload={card.structValue} />);
  }

  _handleQuickReplyPayload(event, payload, text) {
    event.preventDefault();
    event.stopPropagation();

    switch (payload) {
      case "recommended_yes":
        this.df_event_query("SHOW_RECOMMENDATIONS");
        break;
      case "custom_masterclass":
        this.df_event_query("MASTERCLASS");
        break;
      default:
        this.df_text_query(text);
        break;
    }
  }

  renderOneMessage(message, i) {
    if (message.msg && message.msg.text && message.msg.text.text) {
      return (
        <Message speaks={message.speaks} text={message.msg.text.text} key={i} />
      );
    } else if (
      message.msg &&
      message.msg.payload &&
      message.msg.payload.fields &&
      message.msg.payload.fields.cards
    ) {
      return (
        <div key={i}>
          <div className='card-panel grey lighten-5 z-depth-1'>
            <div style={{ overflow: "hidden" }}>
              <div className='col s2'>
                <a className='btn-floating btn-large waves-effect waves-light red'>
                  {message.speaks}
                </a>
              </div>
              <div style={{ overflow: "auto", overflowY: "scroll" }}>
                <div
                  style={{
                    height: 300,
                    width:
                      message.msg.payload.fields.cards.listValue.values.length *
                      270
                  }}
                >
                  {this.renderCards(
                    message.msg.payload.fields.cards.listValue.values
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    } else if (
      message.msg &&
      message.msg.payload &&
      message.msg.payload.fields &&
      message.msg.payload.fields.quick_replies
    ) {
      return (
        <QuickReplies
          text={
            message.msg.payload.fields.text
              ? message.msg.payload.fields.text
              : null
          }
          key={i}
          replyClick={this._handleQuickReplyPayload}
          speaks={message.speaks}
          payload={message.msg.payload.fields.quick_replies.listValue.values}
        />
      );
    }
  }

  renderMessages(stateMessages) {
    if (stateMessages) {
      return stateMessages.map((message, i) => {
        return this.renderOneMessage(message, i);
      });
    } else {
      return null;
    }
  }

  _handleInputKeyPress(e) {
    if (e.key === "Enter") {
      this.df_text_query(e.target.value);
      e.target.value = "";
    }
  }

  render() {
    if (this.state.showBot) {
      return (
        <div
          style={{
            height: 500,
            width: 400,
            position: "absolute",
            bottom: 0,
            right: 0,
            border: "1px solid lightgrey"
          }}
        >
          <div
            id='chatbot'
            style={{ height: 388, width: "100%", overflow: "auto" }}
          >
            <nav>
              <div className='nav-wrapper'>
                <a className='brand-logo'>Chatbot</a>
                <ul id='nav-mobile' className='right hide-on-med-and-down'>
                  <li>
                    <a href='/' onClick={this.hide}>
                      Close
                    </a>
                  </li>
                </ul>
              </div>
            </nav>
            {this.renderMessages(this.state.messages)}
            <div
              ref={el => {
                this.messagesEnd = el;
              }}
              style={{ float: "left", clear: "both" }}
            ></div>
          </div>
          <div className='col s12'>
            <input
              style={{
                margin: 0,
                paddingLeft: "1%",
                paddingRight: "1%",
                width: "98%"
              }}
              ref={input => {
                this.talkInput = input;
              }}
              placeholder='Type a message: '
              id='user_says'
              type='text'
              onKeyPress={this._handleInputKeyPress}
            />
          </div>
        </div>
      );
    } else {
      return (
        <div
          style={{
            height: 40,
            width: 400,
            position: "absolute",
            bottom: 0,
            right: 0,
            border: "1px solid lightgrey"
          }}
        >
          <div
            id='chatbot'
            style={{ height: 388, width: "100%", overflow: "auto" }}
          >
            <nav>
              <div className='nav-wrapper'>
                <a href='/' className='brand-logo'>
                  Chatbot
                </a>
                <ul id='nav-mobile' className='right hide-on-med-and-down'>
                  <li>
                    <a href='/' onClick={this.show}>
                      Show
                    </a>
                  </li>
                </ul>
              </div>
            </nav>
            <div
              ref={el => {
                this.messagesEnd = el;
              }}
              style={{ float: "left", clear: "both" }}
            ></div>
          </div>
        </div>
      );
    }
  }
}

export default withRouter(Chatbot);
