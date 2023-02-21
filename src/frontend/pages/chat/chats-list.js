import { LitElement, html, css } from "lit";

import "../../components/avatar.js";
import "./conversation.js";

class ConversationList extends LitElement {
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
    return html``;
  }
}

customElements.define("il-chats-list", ConversationList);
