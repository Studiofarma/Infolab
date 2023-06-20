import { LitElement, html, css } from "lit";

import "../../../components/button-icon";
import { IconNames } from "../../../enums/icon-names";

export class ChatHeader extends LitElement {
  static get properties() {
    return {
      userName: "",
      roomName: "",
    };
  }

  static styles = css`
    .chatHeader {
      background: #083c72;
      height: 40px;
      padding: 15px 30px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: white;
      position: fixed;
      width: calc(100vw - 400px);
      border-bottom: 1px solid black;
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

    .settings {
      transition: 1s;
    }

    .settings:hover {
      transform: rotate(180deg);
    }

    .contact {
      width: 95%;
      display: flex;
      justify-content: space-between;
    }
  `;

  render() {
    return html`
      <div class="chatHeader">
        <div class="settings">
          <il-button-icon content=${IconNames.settings}></il-button-icon>
        </div>

        <div class="contact">
          <h2>${this.roomName}</h2>
          <!-- Username will not be here, need to be removed, only for debug -->
          <h2>Nome utente: ${this.userName}</h2>
        </div>
      </div>
    `;
  }
}

customElements.define("il-chat-header", ChatHeader);
