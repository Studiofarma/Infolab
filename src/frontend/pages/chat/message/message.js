import { LitElement, html, css } from "lit";

import { resolveMarkdown } from "lit-markdown";
import { MarkdownService } from "../../../services/markdown-service";

import { CookieService } from "../../../services/cookie-service";

import { IconNames } from "../../../enums/icon-names";

import "./message-options";
import "../../../components/popover";
import "./message-content";

const menuOptionLeft = "-73px";
const menuOptionRight = "33px";
const lastMenuOptionTop = "-86px";
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

    il-button-icon {
      background-color: white;
      border-radius: 6px;
      box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
    }

    il-popover {
      opacity: 0;
      transition: 0.5s;
    }

    .message-body:hover il-popover {
      opacity: 1;
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
        <il-message-content
          class=${this.message.sender == this.cookie.username
            ? "sender"
            : "receiver"}
          .message=${this.message}
          .activeChatName=${this.activeChatName}
        ></il-message-content>

        <!-- end -->

        <il-popover .popupCoords=${{ ...this.getPopupCoords() }}>
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

  getPopupCoords() {
    if (this.index === this.messages.length - 1 && this.messages.length !== 1) {
      return this.message.sender == this.cookie.username
        ? { top: lastMenuOptionTop, left: menuOptionLeft }
        : { top: lastMenuOptionTop, right: menuOptionRight };
    }

    return this.message.sender == this.cookie.username
      ? { top: "0px", left: menuOptionLeft }
      : { top: "0px", right: menuOptionRight };
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
