import { html, css } from "lit";
import { when } from "lit/directives/when.js";

import { IconNames } from "../../../../enums/icon-names";
import { HtmlParserService } from "../../../../services/html-parser-service";
import { ThemeColorService } from "../../../../services/theme-color-service";

import { ThemeCSSVariables } from "../../../../enums/theme-css-variables";

import { BaseComponent } from "../../../../components/base-component";

import "../../../../components/icon";
import "../../../../components/button-icon";
import { MessageStatuses } from "../../../../enums/message-statuses";
import { GenericConstants } from "../../../../enums/generic-constants";
import { UserDto } from "../../../../models/user-dto";
import { UsersService } from "../../../../services/users-service";

class Conversation extends BaseComponent {
  static properties = {
    conversation: {},
    isSelectable: false,
    isSelected: false,
    conversationUser: { type: Object },
    lastMessageUser: { type: Object },
    loggedUser: { type: UserDto },
  };

  async connectedCallback() {
    super.connectedCallback();

    this.loggedUser = await UsersService.getLoggedUser();
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
      width: 184px;
      height: 25px;
    }

    .last-message-sender {
      color: #083c72;
      width: 184px;
      font-size: 11px;
      margin-top: -3px;
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
      width: 184px;
    }

    il-button-icon {
      padding-top: 10px;
    }

    .truncate {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
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
        data-cy="chat-box"
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
          <p class="chat-name truncate" data-cy="chat-name">
            ${this.conversation?.description}
          </p>
          <p class="last-message truncate">${this.formatLastMessageText()}</p>
          <p class="last-message-sender truncate">
            ${this.chooseUserneameToShow()}
          </p>
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
    let content = lastMessage.content;

    if (lastMessage.status === MessageStatuses.deleted) {
      content = GenericConstants.deletedMessageContent;
    }

    if (content) {
      text = content;
    } else {
      text = "Nuova conversazione";
    }

    let textHtml = HtmlParserService.parseFromString(text);

    textHtml.classList.add("truncate");

    if (textHtml.getElementsByTagName("br").length !== 0) {
      let brIndex = textHtml.innerHTML.indexOf("<br>");

      let textAfterFirstBr = textHtml.innerHTML.substring(
        brIndex,
        textHtml.innerHTML.length
      );
      console.log(textAfterFirstBr);

      if (textAfterFirstBr.length === 4) {
        textHtml.innerHTML.replace("<br>", "");
      } else {
        textHtml.innerHTML =
          textHtml.innerHTML.substring(0, textHtml.innerHTML.indexOf("<br>")) +
          "...";
      }
    }

    return textHtml;
  }

  chooseUserneameToShow() {
    let text = "";
    const lastMessage = this.conversation.lastMessage;
    let content = lastMessage.content;
    const sender = lastMessage.sender;
    const description = this.conversation.description;
    const loggedUsername = this.loggedUser?.name;
    const userDescription = this.lastMessageUser?.description;

    if (lastMessage.status === MessageStatuses.deleted) {
      content = GenericConstants.deletedMessageContent;
    }

    if (content) {
      text = sender.name === loggedUsername ? `Tu` : `${userDescription}`;
    }

    return text;
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
