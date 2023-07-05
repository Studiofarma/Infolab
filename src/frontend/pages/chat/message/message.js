import { LitElement, html, css } from "lit";
import { ref, createRef } from "lit/directives/ref.js";

import { CookieService } from "../../../services/cookie-service";

import "./message-options";
import "../../../components/popover";
import "./message-content";
import "./message-menu-popover";

export class Message extends LitElement {
  static properties = {
    messages: { type: Array },
    message: { type: Object },
    index: { type: Number },
    activeChatName: { type: String },
    activeDescription: { type: String },
    userList: { type: Array },
  };

  constructor() {
    super();
    this.cookie = CookieService.getCookie();
    this.buttonIconRef = createRef();
    this.messageMenuPopoverRef = createRef();
  }

  static styles = css`
    * {
      margin: 0;
      padding: 0;
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

    .message-timestamp {
      text-align: end;
      font-size: 11px;
      color: #1d1e20;
    }

    .message-date {
      justify-self: center;
      padding: 5px;
      border-radius: 6px;
      background-color: rgb(221, 221, 221);
    }

    il-message-menu-popover {
      z-index: 10;
      transition: 0.5s;
      box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
      border-radius: 5px;
    }
  `;

  render() {
    return html`
      ${this.compareMessageDate(
        this.messages[this.index - 1]?.timestamp,
        this.message.timestamp
      )}

      <div
        class="message-body"
        @mouseover=${this.showPopover}
        @mouseleave=${this.hidePopover}
      >
        <il-message-content
          .userList=${this.userList}
          class=${this.message.sender == this.cookie.username
            ? "sender"
            : "receiver"}
          .message=${this.message}
          .activeChatName=${this.activeChatName}
        ></il-message-content>

        <il-message-menu-popover
          ${ref(this.messageMenuPopoverRef)}
          style="opacity: 0"
          .chatRef=${this.chatRef}
          @message-copy=${this.messageCopy}
          .messages=${this.messages}
          .message=${this.message}
          .index=${this.index}
          .activeChatName=${this.activeChatName}
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
        >
        </il-message-menu-popover>
      </div>
    `;
  }

  showPopover() {
    this.messageMenuPopoverRef.value.style.opacity = "1";
  }

  hidePopover() {
    this.messageMenuPopoverRef.value.style.opacity = "0";
  }

  messageCopy() {
    this.dispatchEvent(new CustomEvent("message-copy"));
  }

  compareMessageDate(messageDate1, messageDate2) {
    const today = new Date().toDateString();
    const message = new Date(messageDate2).toDateString();

    if (
      new Date(messageDate1).toDateString() ==
      new Date(messageDate2).toDateString()
    ) {
      return "";
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
