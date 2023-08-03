import { html, css } from "lit";
import { when } from "lit/directives/when.js";

import { IconNames } from "../../../../enums/icon-names";
import { CookieService } from "../../../../services/cookie-service";
import { HtmlParserService } from "../../../../services/html-parser-service";
import { ThemeColorService } from "../../../../services/theme-color-service";

import { ThemeCSSVariables } from "../../../../enums/theme-css-variables";

import { BaseComponent } from "../../../../components/base-component";

import "../../../../components/icon";
import "../../../../components/button-icon";

class Conversation extends BaseComponent {
  static properties = {
    conversation: {},
    isSelectable: false,
    isSelected: false,
    conversationUser: { type: Object },
    lastMessageUser: { type: Object },
  };

  constructor() {
    super();
    this.cookie = CookieService.getCookie();
  }

  static styles = css`
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      ${ThemeColorService.getThemeVariables()};
    }

    .chat-box {
      display: flex;
      gap: 12px;
      align-items: flex-start;
      padding: 12px 12px;
      cursor: pointer;
      transition: 0.5s;
      width: 100%;
    }

    .date-box {
      margin-left: auto;
      text-align: right;
    }

    .unread-counter {
      display: flex;
      justify-content: flex-end;
    }

    .last-message {
      color: ${ThemeCSSVariables.conversationLastMessageText};
    }

    .last-message-timestamp {
      color: ${ThemeCSSVariables.conversationTimestapText};
    }

    il-icon {
      border-radius: 50%;
      display: flex;
      height: 24px;
      width: 25px;
      color: ${ThemeCSSVariables.conversationUnreadMessageCounter};
    }

    .unread {
      color: ${ThemeCSSVariables.conversationUnreadMessageText};
    }

    .last-message a[href] {
      color: ${ThemeCSSVariables.conversationLastMessageLinkText};
      text-underline-position: below;
      text-underline-offset: 2px;
      transition: color 0.5s;
    }

    .last-message a[href]:hover {
      color: ${ThemeCSSVariables.conversationLastMessageLinkTextHover};
    }

    .chat-name {
      color: ${ThemeCSSVariables.conversationChatName};
    }

    il-button-icon {
      padding-top: 10px;
    }
  `;

  render() {
    if (this.conversation.unread === 0) {
      this.notificationOpacity = "none";
    } else {
      this.notificationOpacity = "block";
    }

    return html`
      <div
        class="chat-box"
        @click=${() => {
          this.isSelected = !this.isSelected;
          this.dispatchEvent(
            new CustomEvent("il:clicked", {
              detail: {
                room: this.conversation.roomName,
                add: this.isSelected,
              },
            })
          );
        }}
      >
        <il-avatar
          .user=${this.conversationUser}
          .conversation=${this.conversation}
          .isSelected=${this.isSelected && this.isSelectable}
        ></il-avatar>
        <div class="name-box">
          <p class="chat-name">${this.conversation?.description}</p>
          <p class="last-message">${this.formatLastMessageText()}</p>
        </div>
        <div class="date-box">
          <p
            class="last-message-timestamp last-message-timestamp ${this
              .conversation.unreadMessages > 0
              ? "unread"
              : ""}"
          >
            ${this.compareMessageDateWithCurrentDate(
              this.conversation.lastMessage?.timestamp
            )}
          </p>
          <p class="unread-counter">
            ${when(
              this.conversation.unreadMessages > 0,
              () => html`
                <il-icon
                  style="display:${this.notificationOpacity};"
                  name="${this.getUnreadIconName(
                    this.conversation.unreadMessages
                  )}"
                ></il-icon>
              `,
              () => html``
            )}
          </p>
        </div>
      </div>
    `;
  }

  compareMessageDateWithCurrentDate(messageDate) {
    if (!messageDate) {
      return "";
    }

    const today = new Date().toDateString();
    const message = new Date(messageDate).toDateString();

    if (today === message) {
      const time = new Date(messageDate).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      return time;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (yesterday.toDateString() === message) {
      return "Ieri";
    }

    const messageYear = new Date(messageDate).getFullYear();
    const currentYear = new Date().getFullYear();

    if (messageYear === currentYear) {
      const dayMonth = new Date(messageDate).toLocaleDateString("default", {
        day: "2-digit",
        month: "2-digit",
      });
      return dayMonth;
    }

    if (messageYear != currentYear) {
      const fullDate = new Date(messageDate).toLocaleDateString("default", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      return fullDate;
    }

    return "Date not available";
  }

  formatLastMessageText() {
    let text = "";
    const lastMessage = this.conversation.lastMessage;
    const content = lastMessage.content;
    const sender = lastMessage.sender;
    const description = this.conversation.description;
    const loggedUsername = this.cookie.username;
    const userDescription = this.lastMessageUser?.description;

    if (content) {
      if (description !== "Generale") {
        text =
          sender.name === loggedUsername
            ? `Tu: ${content}`
            : `${userDescription}: ${content}`;
      } else {
        text =
          sender.name === loggedUsername
            ? `Tu: ${content}`
            : `${userDescription}: ${content}`;
      }
    } else {
      text = "Nuova conversazione";
    }

    return HtmlParserService.parseFromString(this.fixLastMessageLength(text));
  }

  fixLastMessageLength(message) {
    const messageLines = message
      .split("<br>")
      .join("\n")
      .split("<ul>")
      .join("\n")
      .split("<ol>")
      .join("\n")
      .split("\n");

    if (messageLines.length > 1) {
      message = messageLines[0].replaceAll("&nbsp;", "") + "...";
    }

    let maxLength = 20;

    if (message.length > maxLength) {
      message = message.replaceAll("&nbsp;", "").substring(0, maxLength);
      message += "...";
    }

    return message;
  }

  getUnreadIconName(unread) {
    if (unread <= 9) {
      return IconNames[`numeric${unread}`];
    } else {
      return IconNames.numericPlus;
    }
  }
}

customElements.define("il-conversation", Conversation);
