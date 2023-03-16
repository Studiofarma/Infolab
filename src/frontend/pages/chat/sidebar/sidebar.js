import { LitElement, html, css } from "lit";

import "./search-chats.js";
import "./conversation/conversation-list.js";

export class Sidebar extends LitElement {
  static styles = css`
    div {
      background: #083c72;
      color: white;
      padding-top: 10px;
      display: flex;
      flex-direction: column;
      box-shadow: 1px 1px 8px black;
      z-index: 1100;
      height: calc(100vh - 10px);
      position: fixed;
      width: 350px;
    }
  `;

  render() {
    return html`
      <div>
        <il-search></il-search>
        <il-conversation-list></il-conversation-list>
      </div>
    `;
  }
}

customElements.define("il-sidebar", Sidebar);
