import { LitElement, html, css } from "lit";
import { createRef, ref } from "lit/directives/ref.js";

import {ThemeColorService } from "../../../services/theme-color-service"

import "./conversation/conversation-list";

const layoutID = "sidebar"

export class Sidebar extends LitElement {
  static properties = {
    login: {
      username: "",
      password: "",
      headerName: "",
      token: "",
    },
  };

  constructor() {
    super();
    // Refs
    this.sidebarListRef = createRef();
  }

  static styles = css`

   * {
    ${ThemeColorService.applyStyle(layoutID)};
   }

    .side-bar {
      background: var(--sidebarBg);
      color: white;
      display: flex;
      flex-direction: column;
      height: 100vh;
      width: 350px;
      box-shadow: 2px 0 8px var(--boxShadow);
      z-index: 1100;
    }

    .conversation-list {
      margin: 0 5px 0 7px;
      height: 100%;
      display: flex;
      flex-direction: column;
    }
  `;

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
