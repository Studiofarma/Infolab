import { LitElement, css, html } from "lit";
import { resolveMarkdown } from "lit-markdown";

import { CookieService } from "../../../services/cookie-service";
import { MarkdownService } from "../../../services/markdown-service";

export class MessageContent extends LitElement {
  static properties = {
    message: { type: Object },
    activeChatName: { type: String },
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

    *:hover .settings-container {
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

    .message a[href] {
      color: blue;
      text-underline-position: below;
      text-underline-offset: 2px;
      transition: color 0.5s;
    }
  `;

  render() {
    return html`
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
    `;
  }
}

customElements.define("il-message-content", MessageContent);