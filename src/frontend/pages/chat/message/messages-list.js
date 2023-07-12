import { LitElement, css, html } from "lit";
import { repeat } from "lit/directives/repeat.js";
import { when } from "lit/directives/when.js";
import { createRef, ref } from "lit/directives/ref.js";

import { CookieService } from "../../../services/cookie-service";
import { UsersService } from "../../../services/users-service";

import "./empty-messages";

const fullScreenHeight = "100vh";

export class MessagesList extends LitElement {
  static properties = {
    messages: { type: Array },
    activeChatName: { type: String },
    activeDescription: { type: String },
    users: { type: Array },
  };

  constructor() {
    super();

    this.cookie = CookieService.getCookie();

    this.getAllUsers();

    // Refs
    this.messageBoxRef = createRef();
  }

  static styles = css`
    * {
      box-sizing: border-box;
      width: 100%;
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
      background-color: #206cf7;
      min-height: 40px;
    }

    .message-box > il-message {
      display: grid;
      flex-direction: column;
      max-width: 100%;
    }

    il-empty-messages {
      height: 100%;
    }
  `;

  render() {
    return html`
      ${when(
        this.messages.length > 0,
        () => html`<ul
          ${ref(this.messageBoxRef)}
          @scroll=${(event) => {
            this.dispatchEvent(
              new CustomEvent(event.type, { detail: event.detail })
            );
          }}
          class="message-box"
          style="height: calc(${fullScreenHeight} - 179px);"
          ${ref(this.messageBoxRef)}
        >
          ${repeat(
            this.messages,
            (message) => message.id,
            (message, index) =>
              html` <il-message
                .userList=${this.users}
                .messages=${this.messages}
                .message=${message}
                .index=${index}
                .activeChatName=${this.activeChatName}
                .activeDescription=${this.activeDescription}
                @message-copy=${this.messageCopy}
                @forward-message=${(event) => {
                  this.dispatchEvent(
                    new CustomEvent(event.type, { detail: event.detail })
                  );
                }}
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
              ></il-message>`
          )}
        </ul>`,
        () => html`<il-empty-messages></il-empty-messages>`
      )}
    `;
  }

  messageCopy() {
    this.dispatchEvent(new CustomEvent("message-copy"));
  }

  async getAllUsers() {
    try {
      this.users = await UsersService.getUsers("");
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

    this.messageBoxRef.value.scrollTo({
      top: this.messageBoxRef.value.scrollHeight,
    });
  }

  checkScrolledToBottom() {
    try {
      return (
        this.messageBoxRef.value.scrollHeight -
          this.messageBoxRef.value.offsetHeight <=
        this.messageBoxRef.value.scrollTop + 10
      );
    } catch (error) {
      return false;
    }
  }
}

customElements.define("il-messages-list", MessagesList);
