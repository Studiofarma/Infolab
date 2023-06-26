import { LitElement, html, css } from "lit";

import { IconNames } from "../../../enums/icon-names.js";

import "./message-menu-option";

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
        @click=${this.copyToClipboardHandler}
      >
      </message-menu-option>

      <message-menu-option
        iconName=${IconNames.mdiShare}
        text="Inoltra"
        @click=${this.forwardMessageHandler}
      >
      </message-menu-option>

      ${this.type === "receiver"
        ? html` <message-menu-option
            iconName=${IconNames.mdiMessage}
            text="Scrivi in privato"
            @click=${this.goToChatHandler}
          >
          </message-menu-option>`
        : html``}

      <message-menu-option
        iconName=${IconNames.mdiDelete}
        text="Elimina"
        @click=${this.deleteMessageHandler}
      >
      </message-menu-option>
    `;
  }

  copyToClipboardHandler() {
    navigator.clipboard.writeText(this.message.content);
  }

  forwardMessageHandler() {
    this.dispatchEvent(
      new CustomEvent("onForwardMessage", {
        detail: {
          messageToForward: this.message.content,
        },
      })
    );
  }

  goToChatHandler() {
    console.log(this.message)
    this.dispatchEvent(
      new CustomEvent("onGoToChat", {
        detail: {
          description: this.message.sender,
        },
      })
    );
  }

  deleteMessageHandler() {
    let chatElement = document
      .querySelector("body > il-app")
      .shadowRoot.querySelector("il-chat");

    chatElement.messages.splice(this.index, 1);
    chatElement.update();
    this.requestUpdate();
  }
}

customElements.define("il-message-settings", MessageSettings);
