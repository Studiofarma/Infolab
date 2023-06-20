import { LitElement, html, css } from "lit";

import "../../../components/button-icon";
import "../../../components/avatar";
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

    .chatHeader .contact {
      order: 1;
      display: flex;
      gap: 1em;
    }

    .contact {
      width: 100%;
      display: flex;
      justify-content: space-between;
    }

    #profileContainer {
      display: flex;
    }

    #profileContainer il-avatar {
      vertical-align: center;
      padding: 15px;
    }
  `;

  render() {
    return html`
      <div class="chatHeader">
        <div class="contact">
          <h2>${this.roomName}</h2>
          <div id="profileContainer">
            <il-avatar name=${this.userName}></il-avatar>
            <h2>${this.userName}</h2>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define("il-chat-header", ChatHeader);
