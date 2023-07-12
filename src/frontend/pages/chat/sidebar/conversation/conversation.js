import { LitElement, html, css } from "lit";
import { when } from "lit/directives/when.js";

import { IconNames } from "../../../../enums/icon-names";
import { CookieService } from "../../../../services/cookie-service";
import { HtmlParserService } from "../../../../services/html-parser-service";
import { ThemeColorService } from "../../../../services/theme-color-service";

import { ThemeCSSVariables } from "../../../../enums/theme-css-variables";

import "../../../../components/icon";
import "../../../../components/button-icon";

class Conversation extends LitElement {
  static properties = {
    conversation: {},
    isSelectable: false,
    isSelected: false,
    user: { type: Object },
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
            new CustomEvent("clicked", {
              detail: {
                room: this.conversation.roomName,
                add: this.isSelected,
              },
            })
          );
        }}
      >
        <il-avatar
          .user=${this.user}
          .conversation=${this.conversation}
          .isSelected=${this.isSelected && this.isSelectable}
        ></il-avatar>
        <div class="name-box">
          <p class="chat-name">${this.conversation?.description}</p>
          <p class="last-message">${this.lastMessageTextFormatter()}</p>
        </div>
        <div class="date-box">
          <p
            class="last-message-timestamp last-message-timestamp ${this
              .conversation.unreadMessages > 0
              ? "unread"
              : ""}"
          >
            ${this.compareMessageDate(this.conversation.lastMessage?.timestamp)}
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

  compareMessageDate(messageDate) {
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

  getUserDescription(userName) {
    if (userName === undefined)
      return { username: undefined, description: undefined };
    if (this.userList === undefined)
      return { username: undefined, description: undefined };

    let userIndex = this.userList.findIndex((user) => user.name == userName);
    if (userIndex < 0) return "";
    let user = this.userList[userIndex];
    return user.description;
  }

  lastMessageTextFormatter() {
    let text = "";
    const lastMessage = this.conversation.lastMessage;
    const content = lastMessage.content;
    const sender = lastMessage.sender;
    const description = this.conversation.description;
    const username = this.cookie.username;

    if (content) {
      if (description !== "Generale") {
        text =
          sender === username ? `Tu: ${content}` : `${description}: ${content}`;
      } else {
        const userDescription = this.getUserDescription(sender);
        text =
          sender === username
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
    switch (unread) {
      case 1:
        return IconNames.numeric1;

      case 2:
        return IconNames.numeric2;

      case 3:
        return IconNames.numeric3;

      case 4:
        return IconNames.numeric4;

      case 5:
        return IconNames.numeric5;

      case 6:
        return IconNames.numeric6;

      case 7:
        return IconNames.numeric7;

      case 8:
        return IconNames.numeric8;

      case 9:
        return IconNames.numeric9;

      default:
        return IconNames.numericPlus;
    }
  }
}

customElements.define("il-conversation", Conversation);
