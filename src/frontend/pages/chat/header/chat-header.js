import { LitElement, html, css } from "lit";

import "../../../components/button-icon";
import { IconNames } from "../../../enums/icon-names";

export class ChatHeader extends LitElement {
  static get properties() {
    return {
      username: "",
    };
  }

  static styles = css`
    .chatHeader {
      background: #083c72;
      box-shadow: 0px 1px 5px black;
      height: 40px;
      padding: 15px 30px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: white;
      position: fixed;
      width: 100%;
      z-index: 1000;
    }

    .chatHeader .settings {
      order: 2;
      display: flex;
    }

    .chatHeader .contact {
      order: 1;
      display: flex;
      gap: 1em;
    }
  `;

  render() {
    return html`
      <div class="chatHeader">
        <div class="settings">
          <il-button-icon content=${IconNames.option}></il-button-icon>
        </div>

        <div class="contact">
          <h2>ChatBox ${this.username}</h2>
        </div>
      </div>
    `;
  }
}

customElements.define("il-chat-header", ChatHeader);
