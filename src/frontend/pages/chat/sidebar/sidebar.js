import { LitElement, html, css } from "lit";

import "./search-chats.js";
import "./conversation/conversation-list.js";

export class Sidebar extends LitElement {
  static properties = {
    login: {
      username: "",
      password: "",
      headerName: "",
      token: "",
    },
  };

  static styles = css`
    .side-bar {
      background: #083c72;
      color: white;
      display: flex;
      flex-direction: column;
      height: 100vh;
      width: 350px;
      box-shadow: inset -1px 0px 0px 0px black;
      z-index: 1100;
    }

    .search,
    .conversation-list {
      flex: 1 0 auto;
      margin-right: 5px;
    }
  `;

  constructor() {
    super();
  }

  render() {
    return html`
      <div class="side-bar">
        <il-search
          class="search"
          @load-chat=${(e) => {
            this.loadChat(e);
          }}
          @search-chat="${this.searchChat}"
        ></il-search>
        <il-conversation-list class="conversation-list"></il-conversation-list>
      </div>
    `;
  }

  loadChat(e) {
    this.shadowRoot
      .querySelector("il-conversation-list")
      .selectChat(e.detail.selectedChatName);
  }

  searchChat(event) {
    let query = event.detail.query;

    let il_conversation_list = document
      .querySelector("body > il-app")
      .shadowRoot.querySelector("il-chat")
      .shadowRoot.querySelector("main > section > il-sidebar")
      .shadowRoot.querySelector("div > il-conversation-list");

    il_conversation_list.searchChat(query);
  }
}

customElements.define("il-sidebar", Sidebar);
