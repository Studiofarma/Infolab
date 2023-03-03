import { LitElement, html, css } from "lit";
const axios = require("axios").default;

import "../../components/avatar.js";
import "./conversation.js";
import { ConversationDto } from "../../models/conversation-dto.js";

class ConversationList extends LitElement {
  static properties = {
    pharmaciesList: { state: true },
  };

  static styles = css`
    * {
      box-sizing: border-box;
      padding: 0;
      margin: 0;
    }

    .pharmaciesList {
      overflow-y: auto !important;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .pharmaciesList {
      transition: 0.5s;
      overflow-y: scroll;
      height: 82vh;
    }

    ::-webkit-scrollbar {
      background-color: #0074bc;
      border-radius: 10px;
      border: 5px solid #003366;
    }

    ::-webkit-scrollbar-thumb {
      background-color: #0da2ff;
      border-radius: 10px;
      width: 5px;
      border: 3px solid #003366;
    }
  `;

  constructor() {
    super();
    this.pharmaciesList = [];
    this.setList();
  }

  render() {
    return html` <div class="pharmaciesList">${this.renderList()}</div> `;
  }

  async executePharmaciesCall() {
    return axios({
      url: "http://localhost:3000/openChats",
      method: "get",
      headers: {
        "X-Requested-With": "XMLHttpRequest",
      },
    });
  }

  setList() {
    let tmp = [];

    this.executePharmaciesCall()
      .then((element) => {
        element["data"].forEach((pharmacy) => {
          tmp.push(pharmacy);
        });

        this.pharmaciesList = tmp;
      })
      .catch((error) => {
        console.log(error);
      });
  }

  renderList() {
    this.checkMessageLength();

    return this.pharmaciesList.map((pharmacy) => {
      let conversation = new ConversationDto(pharmacy);
      return html`<il-conversation .chat=${conversation}></il-conversation>`;
    });
  }

  checkMessageLength() {
    this.pharmaciesList.forEach((pharmacy) => {
      pharmacy.lastMessage = this.normalizeLastMessage(pharmacy.lastMessage);
    });
  }

  normalizeLastMessage(message) {
    if (message.length > 35) {
      message = message.substring(0, 30);
      message += " ...";
    }

    return message;
  }
}

customElements.define("il-conversation-list", ConversationList);
