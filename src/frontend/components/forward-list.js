import { LitElement, html, css } from "lit";
import { ConversationDto } from "../models/conversation-dto.js";
import { CookieService } from "../services/cookie-service";

import "./input-ricerca";

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
    dialog {
      width: 400px;
      z-index: 5000;
      border: none;
      box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
      border-radius: 6px;
      padding: 8px;
      transition: animation 0.5s;
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

      border: none;
      outline: none;
      border-radius: 6px;
      background-color: rgb(242 242 242);
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
			<dialog @click=${(e) => this.closeForwardList(e, "")}>
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
			</dialog>
		`;
  }

  renderForwardList() {
    return this.forwardList.map((pharmacy, index) => {
      let conversation = new ConversationDto(pharmacy);

      return html`
        <div
          @click=${() => {
            this.forwardMessage(conversation, index);
            this.clearSearchInput();
          }}
        >
          <div class="forward-conversation">
            <il-avatar
              .name=${this.getConversationDescription(index)}
            ></il-avatar>
            <p>${this.getConversationDescription( index)}</p>
          </div>
        </div>
      `;
    });
  }

  getConversationDescription(index) {
    let conversationList = document
      .querySelector(" il-app")
      .shadowRoot.querySelector("il-chat")
      .shadowRoot.querySelector(" il-sidebar")
      .shadowRoot.querySelector("il-conversation-list");

    return conversationList.conversationList[index].description;
  }

  clearSearchInput() {
    let input = this.shadowRoot.querySelector("il-input-ricerca");
    input.clear();
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
      e.target.closest(".forward-conversation") === null && // controlla che l'elemento cliccato sia diverso dal componente conversation
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
  }

  fwdSearch(event) {
    this.forwardList = [...this.tmpForwardList];

    let value = event.detail.query.toLowerCase();

    this.forwardList = this.tmpForwardList.filter((user) =>
      user.roomName.toLowerCase().includes(value)
    );

    this.update();
  }

  forwardMessage(conversation, conversationIndex) {
    let conversationList = document
      .querySelector(" il-app")
      .shadowRoot.querySelector("il-chat")
      .shadowRoot.querySelector(" il-sidebar")
      .shadowRoot.querySelector("il-conversation-list");

    conversationList.selectChat(conversation);
    // per il momento il dialog fa visualizzare solo la conversation list; quando invece farà visualizzare l'elenco delle conversazioni completo vi sarà
    //la necessità di distinguere tra la conversationList e la newConversationList
    conversationList.changeDescription(
      conversationList.conversationList,
      conversationIndex
    );

    let chatElement = document
      .querySelector("body > il-app")
      .shadowRoot.querySelector("il-chat");

    chatElement.sendMessage({ detail: { message: this.messageToForward } });

    CookieService.setCookieByKey(
      CookieService.Keys.lastChat,
      conversation.roomName
    );
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
}

customElements.define("il-forward-list", ForwardList);
