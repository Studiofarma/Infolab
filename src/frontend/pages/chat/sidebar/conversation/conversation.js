import { LitElement, html, css } from "lit";

import { IconNames } from "../../../../enums/icon-names";
import { CookieService } from "../../../../services/cookie-service";
import { HtmlParserService } from "../../../../services/html-parser-service";

import "../../../../components/icon";
import "../../../../components/button-icon";

class Conversation extends LitElement {
  static properties = {
    chat: {},
    isSelectable: false,
    isSelected: false,
    userList: [],
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
      color: #3d3f41;
    }

    .last-message-timestamp {
      color: #3d3f41;
    }

    il-icon {
      border-radius: 50%;
      display: flex;
      height: 24px;
      width: 25px;
      color: rgb(13, 162, 255);
    }

    span {
      border-radius: 50%;
      background-color: #e7f3ff;
      height: 25px;
      width: 25px;
      grid-area: unread;
      color: #083c72;
      text-align: center;
      vertical-align: middle;
      line-height: 1.5;
    }

    .unread {
      color: rgb(58 179 255);
    }

    .last-message a[href] {
      color: lightgray;
      text-underline-position: below;
      text-underline-offset: 2px;
      transition: color 0.5s;
    }

    .last-message a[href]:hover {
      color: white;
    }

    .chat-name {
      color: black;
    }

    il-button-icon {
      padding-top: 10px;
    }
  `;

  render() {
    if (this.chat.unread === 0) {
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
                room: this.chat.roomName,
                add: this.isSelected,
              },
            })
          );
        }}
      >
        <il-avatar
          .selected=${this.isSelected && this.isSelectable}
          .avatarLink=${this.chat.avatarLink}
          .name=${this.chat.description}
          .id=${this.chat.id}
        ></il-avatar>
        <div class="name-box">
          <p class="chat-name">${this.chat.description}</p>
          <p class="last-message">
            ${this.lastMessageTextFormatter(
              this.getUserDescription(this.chat.lastMessage.sender),
              this.chat.lastMessage.content
            )}
          </p>
        </div>
        <div class="date-box">
          <p
            class="last-message-timestamp last-message-timestamp ${this.chat
              .unreadMessages > 0
              ? "unread"
              : ""}"
          >
            ${this.compareMessageDate(this.chat.lastMessage.timestamp)}
          </p>
          <p class="unread-counter">
            ${this.chat.unreadMessages > 0
              ? html`
                  <il-icon
                    style="display:${this.notificationOpacity};"
                    name="${this.getUnreadIconName(this.chat.unreadMessages)}"
                  ></il-icon>
                `
              : html``}
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
    if (this.userList == undefined) return "";

    let userIndex = this.userList.findIndex((user) => user.name == userName);
    if (userIndex < 0) return;
    let user = this.userList[userIndex];
    return {
      username: userName,
      description: user?.description,
    };
  }

  lastMessageTextFormatter(sender, message) {
    if (sender.username == this.cookie.username) {
      sender.description = "Tu";
    }
    return HtmlParserService.parseFromString(
      this.fixLastMessageLength(
        sender.description
          ? `${sender.description}: ${message}`
          : "Nuova conversazione"
      )
    );
  }

  fixLastMessageLength(message) {
    const messageLines = message.split("\n");
    if (messageLines.length > 1) {
      message = messageLines[0] + "...";
    }
    let maxLength = 20;
    if (message.length > maxLength) {
      message = message.substring(0, maxLength);
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
