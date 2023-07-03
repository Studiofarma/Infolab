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
  };

  constructor() {
    super();
    this.cookie = CookieService.getCookie();
    this.buttonIconRef = createRef();
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

    <<<<<<< HEAD .sender,
    .receiver {
      list-style-position: inside;
      position: relative;
      min-width: 300px;
      max-width: 500px;
      padding: 8px 8px 6px 10px;
      box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
      z-index: 3;
    }

    .sender .message > p::selection {
      color: black;
      background-color: white;
    }

    input {
      font-family: inherit;
    }

    .sender {
      border-radius: 10px 0 10px 10px;
      color: black;
      background-color: #c5e1fe;
    }
    .sender::after {
      content: "";
      position: absolute;
      top: 0px;
      right: -9px;
      border-top: 10px solid rgb(197, 225, 254);
      border-left: 0px solid transparent;
      border-right: 10px solid transparent;
      z-index: 3;
    }
    .sender::before {
      content: "";
      position: absolute;
      top: -1px;
      right: -13px;
      border-top: 11px solidrgb(197, 225, 254 / 34%);
      border-left: 0px solid transparent;
      border-right: 12px solid transparent;
      filter: blur(0.8px);
      z-index: 2;
    }

    .receiver {
      border-radius: 0 10px 10px 10px;
      color: black;
      background-color: white;
    }
    .receiver::after {
      content: "";
      position: absolute;
      top: 0px;
      left: -9px;
      border-top: 10px solid white;
      border-left: 10px solid transparent;
      border-right: 0px solid transparent;
      z-index: 3;
    }
    .receiver::before {
      content: "";
      position: absolute;
      top: -1px;
      left: -13px;
      border-top: 11px solid rgb(209 209 209 / 34%);
      border-right: 0px solid transparent;
      border-left: 12px solid transparent;
      filter: blur(0.8px);
      z-index: 2;
    }
    .receiver-name {
      font-size: 13px;
      color: blue;
    }

    .message {
      overflow-wrap: break-word;
    }

    .settings-container {
      position: relative;
      background: white;
      border-radius: 6px;
      box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
      opacity: 0;
      transition: opacity 0.5s;
    }

    .message-body:hover .settings-container {
      opacity: 1;
    }

    .sender ~ .settings-container il-message-settings {
      position: absolute;
      top: 0px;
      left: -89px;
    }

    .receiver ~ .settings-container il-message-settings {
      position: absolute;
      top: 0px;
      right: 33px;
    }

    =======>>>>>>>origin/main .message-timestamp {
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
      opacity: 0;
      transition: 0.5s;
    }

    .message-body:hover il-message-menu-popover {
      opacity: 1;
    }
  `;

  render() {
    return html`
      ${this.compareMessageDate(
        this.messages[this.index - 1]?.timestamp,
        this.message.timestamp
      )}

      <div class="message-body">
        <il-message-content
          class=${this.message.sender == this.cookie.username
            ? "sender"
            : "receiver"}
          .message=${this.message}
          .activeChatName=${this.activeChatName}
        ></il-message-content>

        <il-message-menu-popover
          .chatRef=${this.chatRef}
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
        >
        </il-message-menu-popover>
      </div>
    `;
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
