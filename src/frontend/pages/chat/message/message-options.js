import { html, css } from "lit";
import { when } from "lit/directives/when.js";

import { CookieService } from "../../../services/cookie-service.js";
import { ThemeColorService } from "../../../services/theme-color-service.js";

import { IconNames } from "../../../enums/icon-names.js";
import { HtmlParserService } from "../../../services/html-parser-service.js";
import { ThemeCSSVariables } from "../../../enums/theme-css-variables.js";

import "./message-button-option.js";

import { BaseComponent } from "../../../components/base-component";

export class MessageOptions extends BaseComponent {
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

  static styles = css`
    * {
      ${ThemeColorService.getThemeVariables()};
    }

    div {
      background: ${ThemeCSSVariables.messageMenuBg};
    }
  `;

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
          () =>
            html` <il-message-button-option
              iconName=${IconNames.mdiMessage}
              text="Scrivi in privato"
              @click=${this.wentToChat}
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
          () =>
            html`<il-message-button-option
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
    this.dispatchEvent(new CustomEvent("il:message-copied"));
  }

  forwardMessageHandler() {
    this.dispatchEvent(
      new CustomEvent("il:message-forwarded", {
        detail: {
          messageToForward: this.message.content,
        },
      })
    );
  }

  wentToChat() {
    this.dispatchEvent(
      new CustomEvent("il:went-to-chat", {
        detail: {
          user: this.message.sender,
        },
      })
    );
  }

  deleteMessageHandler() {
    this.dispatchEvent(
      new CustomEvent("il:message-deleted", {
        detail: {
          messageToDelete: this.message,
          messageIndex: this.messageIndex,
        },
      })
    );
  }

  editHandler() {
    this.dispatchEvent(
      new CustomEvent("il:message-edited", {
        detail: {
          message: this.message,
          messageIndex: this.messageIndex,
        },
      })
    );
  }
}

customElements.define("il-message-options", MessageOptions);
