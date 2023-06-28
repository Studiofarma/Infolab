import { LitElement, html, css } from "lit";

import { resolveMarkdown } from "lit-markdown";
import { MarkdownService } from "../../../services/markdown-service";

import { CookieService } from "../../../services/cookie-service";

import { IconNames } from "../../../enums/icon-names";

import "./message-options";
import "../../../components/popover";

const menuOptionLeft = "-73px"
const menuOptionRight = "33px"
const lastMenuOptionTop = "-86px"
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

    .sender,
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
      color: white;
      background-color: rgb(54, 123, 251);
    }
    .sender::after {
      content: "";
      position: absolute;
      top: 0px;
      right: -9px;
      border-top: 10px solid rgb(54, 123, 251);
      border-left: 0px solid transparent;
      border-right: 10px solid transparent;
      z-index: 3;
    }
    .sender::before {
      content: "";
      position: absolute;
      top: -1px;
      right: -13px;
      border-top: 11px solid rgb(209 209 209 / 34%);
      border-left: 0px solid transparent;
      border-right: 12px solid transparent;
      filter: blur(0.8px);
      z-index: 2;
    }

    .sender a:link {
      color: black;
    }

    .sender a:visited {
      color: black;
    }

    .sender a:hover {
      color: white;
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

    il-popover {
      position: relative;
      background: white;
      border-radius: 6px;
      box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
      opacity: 0;
      transition: opacity 0.5s;
      z-index: 1000000;
    }

    .message-body:hover il-popover {
      opacity: 1;
    }

    .sender .message-timestamp {
      text-align: end;
      font-size: 11px;
      color: #e9e9e9;
    }

    .receiver .message-timestamp {
      text-align: end;
      font-size: 11px;
      color: #8c8d8d;
    }

    .message-date {
      justify-self: center;
      padding: 5px;
      border-radius: 6px;
      background-color: rgb(221, 221, 221);
    }

    .message a[href] {
      color: lightgray;
      text-underline-position: below;
      text-underline-offset: 2px;
      transition: color 0.5s;
    }

    .message a[href]:hover {
      color: white;
    }
  `;

  render() {
    return html`
      ${this.compareMessageDate(
        this.messages[this.index - 1]?.timestamp,
        this.message.timestamp
      )}

      <!-- da refactorizzare in una storia apposita -->

      <div class="message-body">
        <!--  message content -->
        <div
          class=${this.message.sender == this.cookie.username
            ? "sender"
            : "receiver"}
        >
          ${this.activeChatName.indexOf(this.cookie.username) === -1
            ? html` <p class="receiver-name">
                ${this.message.sender != this.cookie.username
                  ? this.message.sender
                  : ""}
              </p>`
            : html``}
          <p class="message">
            ${resolveMarkdown(
              MarkdownService.parseMarkdown(this.message.content)
            )}
          </p>
          <p class="message-timestamp">
            ${new Date(this.message.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        <!-- end -->

        <il-popover
          .popupCoords=${ {...this.getPopupCoords() }}
        >
          <il-button-icon
            slot="pop-button"
            content="${IconNames.dotsHorizontal}"
            color="black"
          >
          </il-button-icon>

          <il-message-options
            slot="popup"
            .chatRef=${this.chatRef}
            .message=${this.message}
            .cookie=${this.cookie}
            .index=${this.index}
            .room=${this.activeChatName}
            .type=${this.message.sender == this.cookie.username
              ? "sender"
              : "receiver"}

            @forward-message=${(event) =>
              this.dispatchEvent(
                new CustomEvent(event.type, { detail: event.detail })
              )}
  
  @go-to-chat=${(event) =>
              this.dispatchEvent(
                new CustomEvent(event.type, { detail: event.detail })
              )}
          >
          </il-message-options>
        </il-popover>
      </div>
    `;
  }

  getPopupCoords( ) {

    if (this.index === this.messages.length -1 && this.messages.length !== 1) {
      return this.message.sender == this.cookie.username
      ? { top: lastMenuOptionTop, left: menuOptionLeft }
      : { top: lastMenuOptionTop, right: menuOptionRight }
    } 

    return this.message.sender == this.cookie.username
    ? { top: "0px", left: menuOptionLeft }
    : { top: "0px", right: menuOptionRight }
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
