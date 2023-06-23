import { LitElement, html, css } from "lit";
import { CookieService } from "../services/cookie-service";

import "../pages/chat/sidebar/conversation/conversation-list";

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
				<!-- <div class="forward-list-header">
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
    </div> -->
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
      e.detail.roomName == null && // controlla che l'elemento cliccato sia diverso dal componente conversation
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
