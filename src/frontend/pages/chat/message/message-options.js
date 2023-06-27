import { LitElement, html } from "lit";
import { when } from "lit/directives/when.js";

import { IconNames } from "../../../enums/icon-names.js";

import "./message-button-option.js";

export class MessageOptions extends LitElement {
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
      <message-button-option
        iconName=${IconNames.mdiContentCopy}
        text="Copia"
        @click=${this.copyToClipboardHandler}
      >
      </message-button-option>

      <message-button-option
        iconName=${IconNames.mdiShare}
        text="Inoltra"
        @click=${this.forwardMessageHandler}
      >
      </message-button-option>

      ${when(
        this.type === "receiver",
        () => html` <message-button-option
          iconName=${IconNames.mdiMessage}
          text="Scrivi in privato"
          @click=${this.goToChatHandler}
        >
        </message-button-option>`
      )}

      <message-button-option
        iconName=${IconNames.mdiDelete}
        text="Elimina"
        @click=${this.deleteMessageHandler}
      >
      </message-button-option>
    `;
  }

  copyToClipboardHandler() {
    navigator.clipboard.writeText(this.message.content);
  }

  forwardMessageHandler() {
    this.dispatchEvent(
      new CustomEvent("forward-message", {
        detail: {
          messageToForward: this.message.content,
        },
      })
    );
  }

  goToChatHandler() {
    console.log(this.message);
    this.dispatchEvent(
      new CustomEvent("go-to-chat", {
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

customElements.define("il-message-options", MessageOptions);
