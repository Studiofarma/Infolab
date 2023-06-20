import { LitElement, html, css } from "lit";
import { ConversationDto } from "../models/conversation-dto.js";
import { CookieService } from "../services/cookie-service";

import "./input-ricerca.js";

export class ForwardList extends LitElement {
  static get properties() {
    return {
      forwardList: [],
      forwardListVisibility: false,
    };
  }

  constructor() {
    super();
    this.forwardList = [];
    this.messageToForward = "";
    this.forwardListVisibility = false;
  }

  static styles = css`
    .forward-list-backdrop {
      position: absolute;
      top: 0;
      width: 100%;
      height: 100%;

      background: #00000037;
      z-index: -20;
    }

    .forward-list-container {
      background: white;
      box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
      border-radius: 6px;
      padding: 8px;

      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 300px;
      z-index: 1000;
    }

    .forward-list-header {
      width: 100%;
      border-bottom: 1px solid #e4e4e4;
      margin-bottom: 3px;
    }

    .forward-list-header > p {
      font-size: 20px;
      margin: 0;
    }

    .forward-list-search {
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .forward-list-search > il-input-ricerca {
      margin: 5px 0;
      padding: 8px;
      width: 100%;
    }

    .forward-list-scrollable {
      height: 400px;
      overflow-y: scroll;
    }

    .forward-list-section-title {
      background: white;
      padding: 5px 0px;
      position: sticky;
      top: -3px;
    }

    .forward-list-body {
      z-index: 1000;
      width: 99%;
      display: flex;
      flex-direction: column;
      gap: 5px;
      padding: 5px 0;
      cursor: pointer;
    }

    .forward-list-scrollable::-webkit-scrollbar {
      border-radius: 10px;
      width: 4px;
    }

    .forward-list-scrollable::-webkit-scrollbar-track {
      background-color: none;
      border-radius: 10px;
    }

    .forward-list-scrollable::-webkit-scrollbar-thumb {
      background-color: #cacaca;
      border-radius: 10px;
      min-height: 40px;
    }

    .forward-conversation {
      display: flex;
      align-items: center;
      border-radius: 6px;
      padding: 3px;
      gap: 5px;
    }

    .forward-conversation:hover {
      background-color: #f5f5f5;
    }
  `;

  render() {
    return html`
      <div
        class="forward-list-backdrop"
        style="${this.forwardListVisibility ? "z-index: 500" : ""}"
        @click="${() => {
          this.setForwardListVisibility(false);
        }}"
      >
        <div
          class="forward-list-container"
          @click="${(e) => {
            e.stopPropagation();
          }}"
          style="${this.forwardListVisibility ? "" : "display: none;"}"
        >
          <div class="forward-list-header">
            <p>Inoltra messaggio</p>
            <div class="forward-list-search">
              <il-input-ricerca
                placeholder="Cerca"
                id="fwdSearch"
                @search=${this.fwdSearch}
              ></il-input-ricerca>
            </div>
          </div>
          <div class="forward-list-scrollable">
            <div class="forward-list-section">
              <div class="forward-list-section-title">Chat</div>
              <div class="forward-list-body">${this.renderForwardList()}</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderForwardList() {
    return this.forwardList.map((pharmacy) => {
      let conversation = new ConversationDto(pharmacy);
      let roomName = this.activeChatNameFormatter(conversation.roomName);

      return html`
        <div
          @click=${() => {
            this.setForwardListVisibility(false);
            this.forwardMessage(roomName);
            this.clearSearchInput();
          }}
        >
          <div class="forward-conversation">
            <il-avatar .name=${roomName}></il-avatar>
            <p>${roomName}</p>
          </div>
        </div>
      `;
    });
  }

  clearSearchInput() {
    let input = this.shadowRoot.querySelector("il-input-ricerca");
    input.clear();
  }

  forwardMessageHandler(e) {
    this.messageToForward = e.message;
    this.updateForwardList();
    this.setForwardListVisibility(true);
  }

  setForwardListVisibility(forwardListVisibility) {
    this.forwardListVisibility = forwardListVisibility;
  }

  forwardMessage(roomName) {
    this.goToChat(roomName);

    let chatElement = document
      .querySelector("body > il-app")
      .shadowRoot.querySelector("il-chat");

    chatElement.sendMessage({ detail: { message: this.messageToForward } });
  }

  fwdSearch(event) {
    this.forwardList = [...this.tmpForwardList];

    let value = event.detail.query.toLowerCase();

    this.forwardList = this.tmpForwardList.filter((user) =>
      user.roomName.toLowerCase().includes(value)
    );

    this.update();
  }

  goToChat(roomName) {
    let conversationList = document
      .querySelector("body > il-app")
      .shadowRoot.querySelector("il-chat")
      .shadowRoot.querySelector("main > section > il-sidebar")
      .shadowRoot.querySelector("div > il-conversation-list");

    conversationList.selectChat(roomName);
  }

  updateForwardList() {
    let convList = document
      .querySelector("body > il-app")
      .shadowRoot.querySelector("il-chat")
      .shadowRoot.querySelector("main > section > il-sidebar")
      .shadowRoot.querySelector("div > il-conversation-list");
    this.tmpForwardList = [...convList.conversationList];
    this.forwardList = [...convList.conversationList];
  }

  activeChatNameFormatter(activeChatName) {
    let cookie = CookieService.getCookie();
    if (activeChatName.includes("-")) {
      activeChatName = activeChatName.split("-");
      activeChatName.splice(activeChatName.indexOf(cookie.username), 1);
      return activeChatName[0];
    }
    return activeChatName;
  }
}

customElements.define("il-forward-list", ForwardList);
