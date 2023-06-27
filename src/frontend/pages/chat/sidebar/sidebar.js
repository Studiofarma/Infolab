import { LitElement, html, css } from "lit";

import "./conversation/conversation-list";

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
      background: #f2f4f7;
      color: white;
      display: flex;
      flex-direction: column;
      height: 100vh;
      width: 350px;
      box-shadow: 2px 0 8px #b7b9bd;
      z-index: 1100;
    }

    .conversation-list {
      margin: 0 5px 0 7px;
      height: 100%;
      display: flex;
      flex-direction: column;
    }
  `;

  constructor() {
    super();
  }

  render() {
    return html`
      <div class="side-bar">
        <il-conversation-list class="conversation-list"></il-conversation-list>
      </div>
    `;
  }

  loadChat(e) {
    this.shadowRoot
      .querySelector("il-conversation-list")
      .selectChat(e.detail.selectedChatName);
  }
}

customElements.define("il-sidebar", Sidebar);
