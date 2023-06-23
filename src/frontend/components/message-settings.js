import { LitElement, html, css } from "lit";

import { IconNames } from "../enums/icon-names.js";

import "./button-icon.js";
import "./icon.js";
import "./message-menu-option.js";

export class MessageSettings extends LitElement {
  static get properties() {
    return {
      message: { type: Object },
      cookie: { type: Object },
      type: { type: String },
      index: { type: Number },
    };
  }

  static styles = css`
    dialog {
      width: fit-content;
      border: none;
      outline: none;
      border-radius: 6px;
      box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
    }

    dialog::backdrop {
      background-color: transparent;
    }
  `;

  render() {
    return html`
      <dialog @click=${this.closeDialog} @mouseleave=${this.closeDialog}>
        <message-menu-option
          iconName=${IconNames.mdiContentCopy}
          text="Copia"
          @click=${() =>
            this.copyToClipboard(this.message.content.replaceAll("\\\n", "\n"))}
        >
        </message-menu-option>

        <message-menu-option
          iconName=${IconNames.mdiShare}
          text="Inoltra"
          @click=${() => this.forwardMessage(this.message.content)}
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
      </dialog>
    `;
  }

  openDialog() {
    let dialog = this.renderRoot.querySelector("dialog");
    dialog.show();
  }

  closeDialog() {
    let dialog = this.renderRoot.querySelector("dialog");
    dialog.close();
  }

  copyToClipboard(text) {
    navigator.clipboard.writeText(text);
  }

  forwardMessage(text) {
    let forwardListElement = document
      .querySelector("body > il-app")
      .shadowRoot.querySelector("il-chat")
      .shadowRoot.querySelector("il-forward-list");

    let e = { message: text };

    forwardListElement.forwardMessageHandler(e);
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
