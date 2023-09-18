import { html, css } from "lit";
import { ThemeColorService } from "../../../services/theme-color-service";

import { IconNames } from "../../../enums/icon-names";
import { TooltipTexts } from "../../../enums/tooltip-texts";
import { ThemeCSSVariables } from "../../../enums/theme-css-variables";

import "../../../components/button-icon";

import { BaseComponent } from "../../../components/base-component";
import { UserDto } from "../../../models/user-dto";
import { UsersService } from "../../../services/users-service";

const menuOptionLeft = "-73px";
const menuOptionRight = "33px";
const lastMenuOptionTop = "-86px";

export class MessageMenuPopover extends BaseComponent {
  static properties = {
    messages: { type: Array },
    message: { type: Object },
    messageIndex: { type: Number },
    activeChatName: { type: String },
    loggedUser: { type: UserDto },
  };

  async connectedCallback() {
    super.connectedCallback();

    this.loggedUser = await UsersService.getLoggedUser();
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
          .messageIndex=${this.messageIndex}
          .room=${this.activeChatName}
          .type=${this.message.sender == this.loggedUser?.name
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
      return this.message.sender == this.loggedUser?.name
        ? { top: lastMenuOptionTop, left: menuOptionLeft }
        : { top: lastMenuOptionTop, right: menuOptionRight };
    }

    return this.message.sender == this.loggedUser?.name
      ? { top: "0px", left: menuOptionLeft }
      : { top: "0px", right: menuOptionRight };
  }

  setOpacity(value) {
    this.style.opacity = value;
  }
}

customElements.define("il-message-menu-popover", MessageMenuPopover);
