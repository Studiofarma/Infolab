import { LitElement, html, css } from "lit";

const axios = require("axios").default;

import "../../components/avatar.js";
import "./conversation.js";
class ConversationList extends LitElement {
  static properties = {
    chatsList: [],
  };

  constructor() {
    super();
    this.chatsList = [];
  }

  static styles = css`
    * {
      box-sizing: border-box;
      padding: 0;
      margin: 0;
    }

    :host {
      overflow-y: auto !important;
      display: flex;
      flex-direction: column;
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

  render() {
    return html`
      ${this.chatsList.map(
        (elem) =>
          html`<il-conversation
            name=${elem.name}
            @deleting-conversation=${this.delete}
          ></il-conversation>`
      )}
    `;
  }

  async executePharmaciesCall() {
    return axios({
      url: "http://localhost:3000/pharmacies",
      method: "get",
      headers: {
        "X-Requested-With": "XMLHttpRequest",
      },
    });
  }

  async firstUpdated() {
    //questa funzione mi carica le chat precedentemente lasciate aperte
    let json = await this.executePharmaciesCall();
    let tmp = [];
    json["data"].forEach((pharmacy) => {
      if (pharmacy.is_opened) tmp.push({ name: pharmacy.name, avatar: "#" });
    });
    console.table(tmp);
    this.chatsList = [...tmp];
  }

  delete(event) {
    let names = this.chatsList.map((elem) => elem.name);

    let position;
    names.forEach((name, index) => {
      if (name === event.detail.name) position = index;
    });

    this.chatsList = this.chatsList.filter((_, index) => index !== position);
  }
}

customElements.define("il-chats-list", ConversationList);
