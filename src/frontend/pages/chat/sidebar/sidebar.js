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
      background: #083c72;
      color: white;
      display: flex;
      flex-direction: column;
      height: 100vh;
      width: 350px;
      box-shadow: inset -1px 0px 0px 0px black;
      z-index: 1100;
    }

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
        <il-conversation-list
          class="conversation-list"
          @update-message=${(event) =>
            this.dispatchEvent(
              new CustomEvent(event.type, { detail: event.detail })
            )}
          }
          @onChangeConversation=${(event) =>
            this.dispatchEvent(
              new CustomEvent(event.type, { detail: event.detail })
            )}
        ></il-conversation-list>
      </div>
    `;
  }
}

customElements.define("il-sidebar", Sidebar);
