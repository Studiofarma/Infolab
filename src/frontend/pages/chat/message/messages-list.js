import { LitElement, css, html } from "lit";
import { repeat } from "lit/directives/repeat.js";
import { when } from "lit/directives/when.js";
import { createRef, ref } from "lit/directives/ref.js";

import { CookieService } from "../../../services/cookie-service";
import { UsersService } from "../../../services/users-service";
import { ThemeColorService } from "../../../services/theme-color-service";

import { ThemeCSSVariables } from "../../../enums/theme-css-variables";

import "./empty-messages";
import "../../../components/infinite-scroll";
import { MessagesService } from "../../../services/messages-service";

import { ConversationDto } from "../../../models/conversation-dto";

const fullScreenHeight = "100vh";

export class MessagesList extends LitElement {
  static properties = {
    messages: { type: Array },
    activeChatName: { type: String },
    activeConversation: { type: ConversationDto },
    roomType: { type: String },
    usersList: { type: Array },
    hasMore: { type: Boolean },
  };

  constructor() {
    super();
    this.cookie = CookieService.getCookie();

    this.hasMore = true;

    this.getAllUsers();

    // Refs
    this.messageBoxRef = createRef();
  }

  static styles = css`
    * {
      box-sizing: border-box;
      width: 100%;
      ${ThemeColorService.getThemeVariables()};
    }

    .message-box {
      list-style-type: none;
      display: grid;
      grid-auto-rows: max-content;
      gap: 30px;
      width: 100%;
      overflow-y: auto;
      margin-top: 71px;
      padding: 20px;
    }

    .message-box::-webkit-scrollbar {
      width: 7px;
    }

    .message-box::-webkit-scrollbar-track {
      background-color: none;
    }

    .message-box::-webkit-scrollbar-thumb {
      border-radius: 10px;
      background-color: ${ThemeCSSVariables.scrollbar};
      min-height: 40px;
    }

    .message-box > il-message {
      display: grid;
      flex-direction: column;
      max-width: 100%;
      padding: 16px 0;
    }

    il-empty-messages {
      height: 100%;
    }
  `;

  render() {
    return html`
      ${when(
        this.messages.length > 0,
        () =>
          html`<il-infinite-scroll
            ${ref(this.messageBoxRef)}
            @il:updated-next=${(e) => {
              this.dispatchEvent(new CustomEvent(e.type));
            }}
            @scroll=${(event) => {
              this.dispatchEvent(
                new CustomEvent(event.type, { detail: event.detail })
              );
            }}
            class="message-box"
            style="height: calc(${fullScreenHeight} - 179px);"
            .isReverse=${true}
            .scrollableElem=${this.messageBoxRef?.value}
            .hasMore=${this.hasMore}
            .threshold=${300}
          >
            ${repeat(
              this.messages,
              (message) => message.id,
              (message, index) =>
                html` <il-message
                  .user=${this.getUserByUsername(message.sender)}
                  .messages=${this.messages}
                  .message=${message}
                  .messageIndex=${index}
                  .activeChatName=${this.activeChatName}
                  .activeConversation=${this.activeConversation}
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
                ></il-message>`
            )}
          </il-infinite-scroll>`,
        () => html`<il-empty-messages></il-empty-messages>`
      )}
    `;
  }

  updateScrollPosition() {
    this.messageBoxRef.value?.updateScrollPosition();
  }

  getUserByUsername(username) {
    if (this.usersList == undefined) return "";

    let userIndex = this.usersList.findIndex((user) => user.name == username);
    if (userIndex < 0) return;

    return this.usersList[userIndex];
  }

  async getAllUsers() {
    try {
      this.usersList = await UsersService.getUsers("");
    } catch (error) {
      console.error(error);
    }
  }

  textEditorResized(event) {
    if (this.messageBoxRef.value === undefined) return;

    this.messageBoxRef.value.style.height = `calc(${fullScreenHeight} - ${
      event.detail.height + 150
    }px)`;
  }

  scrollToBottom() {
    if (this.activeChatName === "" || this.messageBoxRef.value === undefined)
      return;

    this.messageBoxRef.value?.scrollTo({
      top: this.messageBoxRef.value.scrollHeight,
    });
  }

  isScrolledToBottom() {
    try {
      return (
        this.messageBoxRef.value.scrollHeight -
          this.messageBoxRef.value.offsetHeight <=
        this.messageBoxRef.value.scrollTop + 10
      );
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}

customElements.define("il-messages-list", MessagesList);
