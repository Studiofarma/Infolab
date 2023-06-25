import { LitElement, html, css } from "lit";

import { IconNames } from "../../../enums/icon-names.js";

export class MessageSettings extends LitElement {
  static get properties() {
    return {
      message: { type: Object },
      cookie: { type: Object },
      type: { type: String },
      index: { type: Number },
    };
  }

  render() {
    return html`
      <message-menu-option
        iconName=${IconNames.mdiContentCopy}
        text="Copia"
        @click=${() => this.copyToClipboard(this.message.content)}
      >
      </message-menu-option>

      <message-menu-option
        iconName=${IconNames.mdiShare}
        text="Inoltra"
        @click=${() => alert("forwarding message!")}
      >
      </message-menu-option>

      ${this.type === "receiver"
        ? html` <message-menu-option
            iconName=${IconNames.mdiMessage}
            text="Scrivi in privato"
            @click=${() => this.goToChat(this.message.sender)}
          >
          </message-menu-option>`
        : html``}

      <message-menu-option
        iconName=${IconNames.mdiDelete}
        text="Elimina"
        @click=${() => {
          this.deleteMessage();
          this.update();
        }}
      >
      </message-menu-option>
    `;
  }

  copyToClipboard(text) {
    navigator.clipboard.writeText(text);
  }

  goToChat(sender) {
    let conversationList = document
      .querySelector("body > il-app")
      .shadowRoot.querySelector("il-chat")
      .shadowRoot.querySelector("main > section > il-sidebar")
      .shadowRoot.querySelector("div > il-conversation-list");

    conversationList.selectChat(sender);
  }

  deleteMessage() {
    let chatElement = document
      .querySelector("body > il-app")
      .shadowRoot.querySelector("il-chat");

    chatElement.messages.splice(this.index, 1);
    chatElement.update();
  }
}

customElements.define("il-message-settings", MessageSettings);
