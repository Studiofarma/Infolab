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
      cookie: { type: Object },
      type: { type: String },
      index: { type: Number },
    };
  }

  constructor() {
    super();
    this.cookie = CookieService.getCookie();
  }

  render() {
    return html`
      <div class=${this.type}>
        <message-button-option
          iconName=${IconNames.mdiContentCopy}
          text="Copia"
          @click=${this.copyToClipboardHandler}
        >
        </message-button-option>

        ${when(
          this.type === "receiver" && this.message.roomName === "general",
          () => html` <message-button-option
            iconName=${IconNames.mdiMessage}
            text="Scrivi in privato"
            @click=${this.goToChatHandler}
          >
          </message-button-option>`
        )}

        <message-button-option
          iconName=${IconNames.mdiShare}
          text="Inoltra"
          @click=${this.forwardMessageHandler}
        >
        </message-button-option>

        ${when(
          this.type === "sender",
          () => html`<message-button-option
              iconName=${IconNames.pencil}
              text="Modifica"
              @click=${this.editHandler}
            ></message-button-option>

            <message-button-option
              iconName=${IconNames.mdiDelete}
              text="Elimina"
              @click=${this.deleteMessageHandler}
            >
            </message-button-option>`,
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
          index: this.index,
        },
      })
    );
  }

  editHandler() {
    this.dispatchEvent(
      new CustomEvent("edit-message", {
        detail: {
          message: this.message,
          index: this.index,
        },
      })
    );
  }
}

customElements.define("il-message-options", MessageOptions);
