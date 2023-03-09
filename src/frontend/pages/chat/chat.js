import { LitElement, html, css } from "lit";
import { resolveMarkdown } from "lit-markdown";
import SockJS from "sockjs-client";
import Stomp from "stompjs";

import { MarkdownService } from "../../services/markdown-services";
import { getMessagesServices } from "../../services/get-messages-service";

import "../../components/button-icon";
import "./search-chats.js";
import "./chats-list.js";
import "./input-controls.js";

export class Chat extends LitElement {
  static properties = {
    stompClient: {},
    messages: [],
    message: "",
    nMessages: 0,
  };

  static get properties() {
    return {
      login: {
        username: "",
        password: "",
        headerName: "",
        token: "",
      },
    };
  }

  constructor() {
    super();
    this.messages = [];
    this.message = "";
    this.nMessages = 0;
  }

  connectedCallback() {
    super.connectedCallback();
    this.createSocket();
  }

  static styles = css`
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    main {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      min-height: 100%;
      background: #d3d3d3;
    }

    input[type="text"] {
      border: none;
      outline: none;
    }

    section {
      display: grid;
      grid-template-columns: 350px auto;
      min-height: 100vh;
    }

    .sidebar {
      background: #083c72;
      color: white;
      padding-top: 10px;
      display: flex;
      flex-direction: column;
      box-shadow: 1px 1px 8px black;
      z-index: 1000;
    }

    .chat {
      position: relative;
    }

    .chatHeader {
      position: fixed;
      top: 0px;
      left: 350px;
      background: #083c72;
      box-shadow: 0px 1px 5px black;
      width: calc(100% - 350px);
      min-height: 50px;
      padding: 15px 30px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: white;
      z-index: 1000;
    }

    .chatHeader .settings {
      order: 2;
      display: flex;
    }

    .chatHeader .contact {
      order: 1;
      display: flex;
      gap: 1em;
    }

    il-input-controls {
      margin-top: auto;
    }

    .messageBox {
      list-style-type: none;
      display: flex;
      flex-direction: column;
      gap: 30px;
      width: 100%;
      height: calc(100% - 110px);
      overflow-y: auto;
      padding: 20px;
      padding-top: 100px;
    }

    .messageBox::-webkit-scrollbar {
      width: 0px;
    }

    li {
      list-style-position: inside;
    }

    .messageBox > li {
      position: relative;
      min-width: 300px;
      max-width: 500px;
      padding: 15px 8px;
      background: #f2f4f7;
      box-shadow: 0 0 10px #989a9d;
    }

    @keyframes rotationAnim {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    #settingsIcon:hover {
      animation: rotationAnim 2s infinite linear;
    }

    :not(.dropdown)::-webkit-scrollbar {
      background-color: #0074bc;
      border-radius: 10px;
      border: 5px solid #083c72;
    }

    :not(.dropdown)::-webkit-scrollbar-thumb {
      background-color: #0da2ff;
      border-radius: 10px;
      width: 5px;
      border: 3px solid #083c72;
    }

    input {
      font-family: inherit;
    }

    .sender {
      align-self: flex-end !important;
      border-radius: 10px 0 10px 10px;
    }
    .sender::after {
      content: "";
      position: absolute;
      transform: translate(50%, -600%);
      bottom: -15px;
      right: -4px;
      border-top: 10px solid #f2f4f7;
      border-left: 0px solid transparent;
      border-right: 10px solid transparent;
    }
    .sender::before {
      content: "";
      position: absolute;
      transform: translate(-50%, -50%);
      bottom: -13px;
      right: -8px;
      border-top: 10px solid #989a9d;
      border-left: 10px solid transparent;
      border-right: 0px solid transparent;
      filter: blur(10px);
    }
    .receiver {
      align-self: flex-start !important;
      border-radius: 0 10px 10px 10px;
    }
    .receiver::after {
      content: "";
      position: absolute;
      transform: translate(50%, -600%);
      bottom: -15px;
      left: -15px;
      border-top: 10px solid #f2f4f7;
      border-left: 10px solid transparent;
      border-right: 0px solid transparent;
    }
    .receiver::before {
      content: "";
      position: absolute;
      transform: translate(-50%, -50%);
      bottom: -13px;
      right: -8px;
      border-top: 10px solid #989a9d;
      border-left: 10px solid transparent;
      border-right: 0px solid transparent;
      filter: blur(10px);
    }
  `;

  render() {
    return html`
      <main>
        <section>
          <div class="sidebar">
            <il-search></il-search>
            <il-chats-list></il-chats-list>
          </div>

          <div class="chat">
            <div class="chatHeader">
              <div class="settings">
                <il-button-icon
                  content="mdiCog"
                  id="settingsIcon"
                ></il-button-icon>
              </div>

              <div class="contact">
                <h2>ChatBox ${this.login.username}</h2>
              </div>
            </div>

            <ul class="messageBox">
              ${this.messages.map(
                (item, _) =>
                  html`
                    <li
                      class=${item.sender == this.login.username
                        ? "sender"
                        : "receiver"}
                    >
                      ${resolveMarkdown(
                        MarkdownService.parseMarkdown(item.content)
                      )}
                    </li>
                  `
              )}
            </ul>

            <il-input-controls
              @send-message="${this.sendMessage}"
            ></il-input-controls>
          </div>
        </section>
      </main>
    `;
  }

  async firstUpdated() {
    getMessagesServices.executeMessagesCall(2).then((messages) => {
      let obj = messages.data[0];
      this.messages = obj.messages;
    });
  }

  createSocket() {
    let basicAuth = window.btoa(
      this.login.username + ":" + this.login.password
    );

    const socket = new SockJS("chat?access_token=" + basicAuth.toString());
    this.stompClient = Stomp.over(socket);

    let headers = {};
    headers[this.login.headerName] = this.login.token;
    this.stompClient.connect(
      headers,
      () => this.onConnect(),
      () => this.onError()
    );
  }

  onConnect() {
    this.stompClient.subscribe("/topic/public", (payload) =>
      this.onMessage(payload)
    );

    this.stompClient.send(
      "/app/chat.register",
      {},
      JSON.stringify({ sender: this.login.username, type: "JOIN" })
    );
  }

  onMessage(payload) {
    var message = JSON.parse(payload.body);

    if (message.content) {
      this.messages.push(message);
      this.update();
    }
  }

  sendMessage(e) {
    this.message = e.detail.message;
    let messageContent = this.message.trim();

    if (messageContent && this.stompClient) {
      const chatMessage = {
        sender: this.login.username,
        content: messageContent,
        type: "CHAT",
      };

      this.stompClient.send("/app/chat.send", {}, JSON.stringify(chatMessage));
    }
  }

  onError(error) {
    console.log(error);
  }
}

customElements.define("il-chat", Chat);
