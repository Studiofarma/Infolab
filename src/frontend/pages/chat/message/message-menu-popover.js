import { LitElement, html, css, adoptStyles } from "lit";
import { CookieService } from "../../../services/cookie-service";
import { ThemeColorService } from "../../../services/theme-color-service";

import { IconNames } from "../../../enums/icon-names";
import { TooltipTexts } from "../../../enums/tooltip-texts";
import { ThemeCSSVariables } from "../../../enums/theme-css-variables";

import "../../../components/button-icon";

import { ElementMixin } from "../../../models/element-mixin";

const menuOptionLeft = "-73px";
const menuOptionRight = "33px";
const lastMenuOptionTop = "-86px";

export class MessageMenuPopover extends ElementMixin(LitElement) {
  static properties = {
    messages: { type: Array },
    message: { type: Object },
    messageIndex: { type: Number },
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
      <il-popover .popupCoords=${{ ...this.getPopupCoordinates() }}>
        <il-button-icon
          slot="pop-button"
          .content="${IconNames.dotsHorizontal}"
          .tooltipText=${TooltipTexts.popoverOptionsMenu}
        ></il-button-icon>

        <il-message-options
          slot="popup"
          .message=${this.message}
          .cookie=${this.cookie}
          .messageIndex=${this.messageIndex}
          .room=${this.activeChatName}
          .type=${this.message.sender == this.cookie.username
            ? "sender"
            : "receiver"}
          @il:message-copied=${(event) => {
            this.dispatchEvent(new CustomEvent(event.type));
          }}
          @il:message-forwarded=${(event) =>
            this.dispatchEvent(
              new CustomEvent(event.type, { detail: event.detail })
            )}
          @il:went-to-chat=${(event) => {
            this.dispatchEvent(
              new CustomEvent(event.type, { detail: event.detail })
            );
          }}
          @il:message-edited=${(event) => {
            this.dispatchEvent(
              new CustomEvent(event.type, { detail: event.detail })
            );
          }}
          @il:message-deleted=${(event) => {
            this.dispatchEvent(
              new CustomEvent(event.type, { detail: event.detail })
            );
          }}
        >
        </il-message-options>
      </il-popover>
    `;
  }

  getPopupCoordinates() {
    if (
      this.messageIndex === this.messages.length - 1 &&
      this.messages.length !== 1
    ) {
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
