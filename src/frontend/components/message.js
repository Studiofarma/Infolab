import { LitElement, html, css } from "lit";

import { resolveMarkdown } from "lit-markdown";
import { MarkdownService } from "../services/markdown-service";

import { CookieService } from "../services/cookie-service";

import { IconNames } from "../enums/icon-names";

export class Message extends LitElement {
  static properties = {
    messages: { type: Array },
    message: { type: String },
    index: { type: Number },
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

    input {
      font-family: inherit;
    }

    .sender {
      justify-self: flex-end;
      border-radius: 10px 0 10px 10px;

      color: white;
      background-color: rgb(54, 123, 251);
      justify-self: flex-end;
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
      justify-self: flex-start;
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

    .message-settings {
      opacity: 0;
      position: absolute;
      top: 50%;
      transform: translate(0, -50%);

      background: white;
      border-radius: 6px;
      box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
    }

    .sender .message-settings {
      color: black;
      left: -40px;
    }

    .receiver .message-settings {
      right: -40px;
    }

    .sender:hover .message-settings,
    .receiver:hover .message-settings {
      opacity: 1;
    }

    .message-settings:hover,
    .menu-options:hover .message-settings {
      opacity: 1;
    }

    .menu-options {
      display: none;
      top: -3px;
      width: max-content;

      padding: 5px;
    }

    .menu-options-section {
      cursor: pointer;
      padding: 4px;
      border-radius: 5px;
      user-select: none;

      display: flex;
      align-items: center;
      gap: 3px;
    }

    .menu-options-section:hover {
      background-color: #f5f5f5;
    }

    .message-settings:hover .menu-options {
      display: block !important;
    }

    .message-settings:hover il-button-icon {
      display: none !important;
    }

    .message-date {
      justify-self: center;
      padding: 5px;
      border-radius: 6px;
      background-color: rgb(221, 221, 221);
    }
  `;

  render() {
    return html`
      ${this.compareMessageDate(
        this.messages[this.index - 1]?.timestamp,
        this.message.timestamp
      )}

      <div
        class=${this.message.sender == this.cookie.username
          ? "sender"
          : "receiver"}
      >
        <p class="receiver-name">
          ${this.message.sender != this.cookie.username
            ? this.message.sender
            : ""}
        </p>
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
        <div class="message-settings">
          <il-button-icon
            content="${IconNames.dotsHorizontal}"
            styleProp="color: black;"
          >
          </il-button-icon>
          <div class="menu-options">
            <div
              class="menu-options-section"
              @click=${() => {
                this.copyToClipboard(this.message.content);
              }}
            >
              <il-icon name=${IconNames.mdiContentCopy}></il-icon>
              Copia
            </div>

            <div
              class="menu-options-section"
              @click=${() => {
                this.forwardMessage(this.message.content);
              }}
            >
              <il-icon name=${IconNames.mdiShare}></il-icon>
              Inoltra
            </div>

            ${this.message.sender != this.cookie.username
              ? html`<div
                  class="menu-options-section"
                  @click=${() => {
                    this.goToChat(this.message.sender);
                  }}
                >
                  <il-icon name=${IconNames.mdiMessage}></il-icon>
                  Scrivi in privato
                </div>`
              : null}

            <div
              class="menu-options-section"
              @click=${() => {
                this.deleteMessage(this.message);
                this.update();
              }}
            >
              <il-icon name=${IconNames.mdiDelete}></il-icon>
              Elimina
            </div>
          </div>
        </div>
      </div>
    `;
  }

  copyToClipboard(text) {
    navigator.clipboard.writeText(text);
  }

  forwardMessage(message) {
    let forwardListElement = document
      .querySelector("body > il-app")
      .shadowRoot.querySelector("il-chat")
      .shadowRoot.querySelector("main > section > div > il-forward-list");

    let e = { message: message };

    forwardListElement.forwardMessageHandler(e);
  }

  goToChat(roomName) {
    let conversationList = document
      .querySelector("body > il-app")
      .shadowRoot.querySelector("il-chat")
      .shadowRoot.querySelector("main > section > il-sidebar")
      .shadowRoot.querySelector("div > il-conversation-list");

    conversationList.selectChat(roomName);
  }

  deleteMessage(message) {
    let chatElement = document
      .querySelector("body > il-app")
      .shadowRoot.querySelector("il-chat");

    chatElement.messages.splice(this.messages.indexOf(message), 1);
    chatElement.update();
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
