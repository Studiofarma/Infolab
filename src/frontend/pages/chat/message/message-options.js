import { LitElement, html } from "lit";
import { when } from "lit/directives/when.js";

import { CookieService } from "../../../services/cookie-service.js";

import { IconNames } from "../../../enums/icon-names.js";
import { HtmlParserService } from "../../../services/html-parser-service.js";

import "./message-button-option.js";

export class MessageOptions extends LitElement {
  static get properties() {
    return {
      message: { type: Object },
      type: { type: String },
      messageIndex: { type: Number },
    };
  }

  constructor() {
    super();
    this.cookie = CookieService.getCookie();
  }

  render() {
    return html`
      <div class=${this.type}>
        <il-message-button-option
          iconName=${IconNames.mdiContentCopy}
          text="Copia"
          @click=${this.copyToClipboardHandler}
        >
        </il-message-button-option>

        ${when(
          this.type === "receiver" && this.message.roomName === "general",
          () => html` <il-message-button-option
            iconName=${IconNames.mdiMessage}
            text="Scrivi in privato"
            @click=${this.goToChatHandler}
          >
          </il-message-button-option>`
        )}

        <il-message-button-option
          iconName=${IconNames.mdiShare}
          text="Inoltra"
          @click=${this.forwardMessageHandler}
        >
        </il-message-button-option>

        ${when(
          this.type === "sender",
          () => html`<il-message-button-option
              iconName=${IconNames.pencil}
              text="Modifica"
              @click=${this.editHandler}
            ></il-message-button-option>

            <il-message-button-option
              iconName=${IconNames.mdiDelete}
              text="Elimina"
              @click=${this.deleteMessageHandler}
            >
            </il-message-button-option>`,
          () => html``
        )}
      </div>
    `;
  }

  copyToClipboardHandler() {
    navigator.clipboard.writeText(
      HtmlParserService.parseToString(this.message.content)
    );
    this.dispatchEvent(new CustomEvent("message-copy"));
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
    this.dispatchEvent(
      new CustomEvent("go-to-chat", {
        detail: {
          user: this.message.sender,
        },
      })
    );
  }

  deleteMessageHandler() {
    this.dispatchEvent(
      new CustomEvent("delete-message", {
        detail: {
          messageToDelete: this.message,
          messageIndex: this.messageIndex,
        },
      })
    );
  }

  editHandler() {
    this.dispatchEvent(
      new CustomEvent("edit-message", {
        detail: {
          message: this.message,
          messageIndex: this.messageIndex,
        },
      })
    );
  }
}

customElements.define("il-message-options", MessageOptions);
