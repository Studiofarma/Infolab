import { html, css } from "lit";
import { ref, createRef } from "lit/directives/ref.js";
import { when } from "lit/directives/when.js";

import { ThemeColorService } from "../../../services/theme-color-service";

import { ThemeCSSVariables } from "../../../enums/theme-css-variables";

import "./message-options";
import "../../../components/popover";
import "./message-content";
import "./message-menu-popover";
import { MessageStatuses } from "../../../enums/message-statuses";

import { ConversationDto } from "../../../models/conversation-dto";
import { BaseComponent } from "../../../components/base-component";
import { UserDto } from "../../../models/user-dto";
import { UsersService } from "../../../services/users-service";

export class Message extends BaseComponent {
  static properties = {
    messages: { type: Array },
    message: { type: Object },
    messageIndex: { type: Number },
    activeChatName: { type: String },
    activeConversation: { type: ConversationDto },
    roomType: { type: String },
    userList: { type: Array },
    user: { type: Object },
    loggedUser: { type: UserDto },
  };

  constructor() {
    super();

    // Refs
    this.buttonIconRef = createRef();
    this.messageMenuPopoverRef = createRef();
  }

  async connectedCallback() {
    super.connectedCallback();

    this.loggedUser = await UsersService.getLoggedUser();
  }

  static styles = css`
    * {
      margin: 0;
      padding: 0;
      ${ThemeColorService.getThemeVariables()};
    }

    .message-body:has(.sender) {
      justify-self: flex-end;
      display: flex;
      flex-direction: row-reverse;
      align-items: center;
      gap: 10px;
    }

    .message-body:has(.receiver) {
      justify-self: flex-start;
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 10px;
    }

    .message-body:has(.receiver) {
      justify-self: flex-start;
    }

    .message-date {
      justify-self: center;
      padding: 5px;
      border-radius: 6px;
      background-color: ${ThemeCSSVariables.datetimeMessageBg};
      color: ${ThemeCSSVariables.datetimeMessageText};
    }

    il-message-menu-popover {
      z-index: 10;
      transition: 0.5s;
      box-shadow: ${ThemeCSSVariables.boxShadowSecondary} 0px 1px 4px;
      border-radius: 5px;
    }

    .message-body:hover il-message-menu-popover {
      z-index: 11;
    }
  `;

  render() {
    return html`
      ${this.renderDateLabels(
        this.messages[this.messageIndex - 1]?.timestamp,
        this.message.timestamp
      )}

      <div
        data-cy="message-body"
        class="message-body"
        @mouseover=${this.showPopover}
        @mouseleave=${this.hidePopover}
      >
        <il-message-content
          .user=${this.user}
          class=${this.message.sender == this.loggedUser?.name
            ? "sender"
            : "receiver"}
          .message=${this.message}
          .activeChatName=${this.activeChatName}
          .activeConversation=${this.activeConversation}
        ></il-message-content>

        ${when(
          this.message.status === MessageStatuses.deleted,
          () => html``,
          () => html`
            <il-message-menu-popover
              style="opacity: 0"
              ${ref(this.messageMenuPopoverRef)}
              .messages=${this.messages}
              .message=${this.message}
              .messageIndex=${this.messageIndex}
              .activeChatName=${this.activeChatName}
              @il:message-copied=${(event) => {
                this.dispatchEvent(new CustomEvent(event.type));
              }}
              @il:message-forwarded=${(event) => {
                this.dispatchEvent(
                  new CustomEvent(event.type, { detail: event.detail })
                );
              }}
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
            </il-message-menu-popover>
          `
        )}
      </div>
    `;
  }

  showPopover() {
    this.messageMenuPopoverRef.value?.setOpacity(1);
  }

  hidePopover() {
    this.messageMenuPopoverRef.value?.setOpacity(0);
  }

  renderDateLabels(messageDate1, messageDate2) {
    const today = new Date().toDateString();
    const message = new Date(messageDate2).toDateString();

    if (
      new Date(messageDate1).toDateString() ==
      new Date(messageDate2).toDateString()
    ) {
      return html``;
    }

    if (today === message) {
      return html`<div class="message-date">Oggi</div>`;
    }

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (yesterday.toDateString() === message) {
      return html`<div class="message-date">Ieri</div>`;
    }

    const dayMonth = new Date(messageDate2).toLocaleDateString("default", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    return html`<div class="message-date">${dayMonth}</div>`;
  }
}

customElements.define("il-message", Message);
