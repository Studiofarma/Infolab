import { LitElement, html, css } from "lit";

import "./conversation/conversation-list";
import { ref, createRef } from "lit/directives/ref.js";

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
      margin: 0 5px 0 7px;
      height: 100%;
      display: flex;
      flex-direction: column;
    }
  `;

  constructor() {
    super();
    // Refs
    this.sidebarListRef = createRef();
  }

  render() {
    return html`
      <div class="side-bar">
        <il-conversation-list
        ${ref(this.sidebarListRef)}
          class="conversation-list"
          @update-message=${(event) =>
            this.dispatchEvent(
              new CustomEvent(event.type, { detail: event.detail })
            )}
          @change-conversation=${(event) =>
            this.dispatchEvent(
              new CustomEvent(event.type, { detail: event.detail })
            )}
        ></il-conversation-list>
      </div>
    `;
  }
}

customElements.define("il-sidebar", Sidebar);
