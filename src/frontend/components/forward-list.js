import { LitElement, html, css } from "lit";
import { ConversationDto } from "../models/conversation-dto.js";
import { CookieService } from "../services/cookie-service";

import "../pages/chat/sidebar/conversation/conversation-list.js";

export class ForwardList extends LitElement {
  static get properties() {
    return {
      forwardList: [],
    };
  }

  constructor() {
    super();
    this.forwardList = [];
    this.messageToForward = "";
  }

  static styles = css`
    * {
      background-color: rgb(8, 60, 114);
    }

    dialog {
      width: 400px;
      z-index: 5000;
      border: none;
      box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
      border-radius: 6px;
      padding: 8px;
      transition: animation 0.5s;
    }

    ::-webkit-scrollbar {
      width: 4px;
      margin-right: 10px;
    }

    ::-webkit-scrollbar-track {
      background-color: none;
    }

    ::-webkit-scrollbar-thumb {
      border-radius: 10px;
      background-color: rgb(54, 123, 251);
    }

    dialog::backdrop {
      background-color: #00000037;
    }

    dialog[open] {
      animation: opening 0.5s ease-out;
    }

    @keyframes opening {
      from {
        transform: scale(0%);
      }
      to {
        transform: scale(100%);
      }
    }

    il-conversation-list {
      height: 700px;
    }
  `;

  render() {
    return html`
      <dialog @click=${(e) => this.closeForwardList(e, "")}>
        <il-conversation-list
          @chat-clicked=${(e) => this.closeForwardList(e, e.detail.roomName)}
        ></il-conversation-list>
      </dialog>
    `;
  }

  forwardMessageHandler(e) {
    this.messageToForward = e.message;
    this.updateForwardList();

    // opening the modal
    let dialog = this.renderRoot.querySelector("dialog");
    dialog.showModal();
  }

  checkIfClickIsOuter(e) {
    let dialog = this.renderRoot.querySelector("dialog");

    return (
      e.offsetX < 0 ||
      e.offsetX > dialog.offsetWidth ||
      e.offsetY < 0 ||
      e.offsetY > dialog.offsetHeight
    );
  }

  closeForwardList(e, roomName) {
    let dialog = this.renderRoot.querySelector("dialog");

    //controllo se viene cliccato un elemento interno al dialog; in quel caso fermo la chiusura

    if (
      dialog.contains(e.target) && //controlla se clicchi un elemento dentro dialog
      e.target.closest("il-conversation-list") === null && // controlla che l'elemento cliccato sia diverso dal componente conversation
      !this.checkIfClickIsOuter(e) // controlla se si sta cliccando nel backdrop
    ) {
      e.stopPropagation();
      return;
    }

    dialog.close();

    if (roomName === "") {
      e.stopPropagation();
      return;
    }

    this.forwardMessage(roomName);
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
      .shadowRoot.querySelector("il-conversation-list");
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
