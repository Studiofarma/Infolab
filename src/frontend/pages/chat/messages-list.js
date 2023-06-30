import { LitElement, css, html } from "lit";
import { repeat } from "lit/directives/repeat.js";
import { createRef, ref } from "lit/directives/ref.js";

const fullScreenHeight = "100vh";

export class MessagesList extends LitElement {
  static properties = {
    messages: { type: Array },
    activeChatName: { type: String },
    activeDescription: { type: String },
  };

  constructor() {
    super();

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
  `;

  render() {
    return html`
      <ul
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
          (message) => message.index,
          (message, index) =>
            html` <il-message
              .messages=${this.messages}
              .message=${message}
              .index=${index}
              .activeChatName=${this.activeChatName}
              .activeDescription=${this.activeDescription}
              .chatRef=${this.chatRef}
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
            ></il-message>`
        )}
      </ul>
    `;
  }

  textEditorResized(event) {
    this.messageBoxRef.value.style.height = `calc(${fullScreenHeight} - ${
      event.detail.height + 150
    }px)`;
  }

  scrollToBottom() {
    if (this.activeChatName === "") return;

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
