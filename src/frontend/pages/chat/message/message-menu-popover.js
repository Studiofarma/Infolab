import { LitElement, css, html } from "lit";
import { CookieService } from "../../../services/cookie-service";
import { ThemeColorService } from "../../../services/theme-color-service";

import { IconNames } from "../../../enums/icon-names";
import { TooltipTexts } from "../../../enums/tooltip-texts";
import { ThemeCSSVariables } from "../../../enums/theme-css-variables";

import "../../../components/button-icon";

const menuOptionLeft = "-73px";
const menuOptionRight = "33px";
const lastMenuOptionTop = "-86px";

export class MessageMenuPopover extends LitElement {
  static properties = {
    messages: { type: Array },
    message: { type: Object },
    index: { type: Number },
    activeChatName: { type: String },
  };

  constructor() {
    super();
    this.cookie = CookieService.getCookie();
  }

  static styles = css`
    * {
      ${ThemeColorService.getThemeVariables()};
    }

    il-button-icon {
      background-color: ${ThemeCSSVariables.messageMenuBg};
      border-radius: 6px;
      box-shadow: ${ThemeCSSVariables.boxShadowSecondary} 0px 1px 4px;
    }
  `;

  render() {
    return html`
      <il-popover .popupCoords=${{ ...this.getPopupCoords() }}>
        <il-button-icon
          slot="pop-button"
          .content="${IconNames.dotsHorizontal}"
          .tooltipText=${TooltipTexts.popoverOptionsMenu}
        ></il-button-icon>

        <il-message-options
          slot="popup"
          @message-copy=${this.messageCopy}
          .message=${this.message}
          .cookie=${this.cookie}
          .index=${this.index}
          .room=${this.activeChatName}
          .type=${this.message.sender == this.cookie.username
            ? "sender"
            : "receiver"}
          @forward-message=${(event) =>
            this.dispatchEvent(
              new CustomEvent(event.type, { detail: event.detail })
            )}
          @go-to-chat=${(event) => {
            this.dispatchEvent(
              new CustomEvent(event.type, { detail: event.detail })
            );
          }}
          @edit-message=${(event) => {
            this.dispatchEvent(
              new CustomEvent(event.type, { detail: event.detail })
            );
          }}
          @delete-message=${(event) => {
            this.dispatchEvent(
              new CustomEvent(event.type, { detail: event.detail })
            );
          }}
        >
        </il-message-options>
      </il-popover>
    `;
  }

  messageCopy() {
    this.dispatchEvent(new CustomEvent("message-copy"));
  }

  getPopupCoords() {
    if (this.index === this.messages.length - 1 && this.messages.length !== 1) {
      return this.message.sender == this.cookie.username
        ? { top: lastMenuOptionTop, left: menuOptionLeft }
        : { top: lastMenuOptionTop, right: menuOptionRight };
    }

    return this.message.sender == this.cookie.username
      ? { top: "0px", left: menuOptionLeft }
      : { top: "0px", right: menuOptionRight };
  }

  setOpacity(value) {
    this.style.opacity = value;
  }
}

customElements.define("il-message-menu-popover", MessageMenuPopover);
