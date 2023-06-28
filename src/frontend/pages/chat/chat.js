import { LitElement, html, css } from "lit";
import { repeat } from "lit/directives/repeat.js";

import SockJS from "sockjs-client";
import Stomp from "stompjs";

import { MessagesService } from "../../services/messages-service";

import { CookieService } from "../../services/cookie-service";

import { IconNames } from "../../enums/icon-names";

import "../../components/message";
import "../../components/button-icon";
import "../../components/icon";
import "../../components/forward-list";
import "./input/input-controls";
import "./sidebar/sidebar";
import "./header/chat-header";
import "./empty-chat";
import { MarkdownService } from "../../services/markdown-service";
import { createRef, ref } from "lit/directives/ref.js";

const fullScreenHeight = "100vh";

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
      activeChatName: "",
      messages: [],
    };
  }

  constructor() {
    super();
    this.messages = [];
    this.message = "";
    this.nMessages = 0;
    this.activeChatName =
      CookieService.getCookieByKey(CookieService.Keys.lastChat) || "";
    this.forwardListVisibility = false;
    this.scrolledToBottom = false;
    window.addEventListener("resize", () => {
      this.scrollToBottom();
    });
    this.inputControlsRef = createRef();
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
      background: #eaecef;
    }

    section {
      display: grid;
      grid-template-columns: 350px auto;
      min-height: 100vh;
    }

    .chat {
      display: flex;
      flex-direction: column;
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

    .message-box {
      list-style-type: none;
      display: grid;
      grid-auto-rows: max-content;
      gap: 30px;
      width: 100%;
      overflow-y: auto;
      padding: 20px;
      margin-top: 71px;
    }

    .scroll-button {
      z-index: 9999;
      position: absolute;
      right: 20px;
      border-radius: 5px;
      padding: 2px;
      background-color: #ffffff;
      color: white;
      opacity: 0;
      transition: opacity 0.2s ease-in-out;
      box-shadow: 0 0 7px 2px #6f7174;
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
      <main>
        <section>
          <il-sidebar
            @update-message="${this.updateMessages}"
            .login=${this.login}
          ></il-sidebar>

          <div class="chat">
            <il-chat-header
              userName=${this.login.username}
              roomName=${this.activeChatNameFormatter(this.activeChatName)}
            ></il-chat-header>

            ${this.activeChatName !== ""
              ? html` <ul
                    @scroll="${this.manageScrollButtonVisility}"
                    class="message-box"
                    style="height: calc(${fullScreenHeight} - 179px);"
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
                        ></il-message>`
                    )}
                  </ul>

                  <il-forward-list></il-forward-list>

                  <il-button-icon
                    style="bottom: 120px"
                    class="scroll-button"
                    @click="${this.scrollToBottom}"
                    content="${IconNames.scrollDownArrow}"
                  ></il-button-icon>

                  <il-input-controls
                    ${ref(this.inputControlsRef)}
                    @send-message=${this.sendMessage}
                    @text-editor-resized=${this.textEditorResized}
                  ></il-input-controls>`
              : html`<il-empty-chat></il-empty-chat>`}
          </div>
        </section>
      </main>
    `;
  }

  async firstUpdated() {
    if (this.activeChatName === "") return;

    MessagesService.getMessagesById(
      this.login.username,
      this.login.password,
      this.activeChatName
    ).then((messages) => {
      this.messages = messages.data.reverse();
    });

    for (var i = 0; i < this.messages.length; i++) {
      this.messages[i].index = i;
    }
  }

  async updateMessages(e) {
    MessagesService.getMessagesById(
      this.login.username,
      this.login.password,
      e.detail.roomName
    ).then((messages) => {
      this.messages = messages.data.reverse();

      for (var i = 0; i < this.messages.length; i++) {
        this.messages[i].index = i;
      }
    });
    this.activeChatName = e.detail.roomName;

    this.inputControlsRef.value.focusEditor();
  }

  async updated() {
    await setTimeout(() => {
      this.scrollToBottom();
    }, 20);
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

  manageScrollButtonVisility() {
    if (this.checkScrolledToBottom()) {
      this.renderRoot.querySelector(".scroll-button").style.opacity = "0";
      return;
    }
    this.renderRoot.querySelector(".scroll-button").style.opacity = "1";
  }

  checkScrolledToBottom() {
    try {
      let element = this.renderRoot.querySelector("ul.message-box");
      return (
        element.scrollHeight - element.offsetHeight <= element.scrollTop + 10
      );
    } catch (error) {
      return false;
    }
  }

  textEditorResized(event) {
    const buttonIcon = this.renderRoot.querySelector("il-button-icon");
    const messageBox = this.renderRoot.querySelector(".message-box");

    buttonIcon.style.bottom = `${event.detail.height + 100}px`;
    messageBox.style.height = `calc(${fullScreenHeight} - ${
      event.detail.height + 150
    }px)`;
  }
  scrollToBottom() {
    if (this.activeChatName === "") return;

    let element = this.renderRoot.querySelector("ul.message-box");
    element.scrollTo({ top: element.scrollHeight });
  }

  onConnect() {
    this.stompClient.subscribe("/topic/public", (payload) =>
      this.onMessage(payload)
    );

    // fixare questo
    this.stompClient.subscribe("/user/topic/me", (payload) =>
      this.onMessage(payload)
    );

    this.stompClient.subscribe(`/queue/${this.login.username}`, (payload) =>
      this.onMessage(payload)
    );

    this.stompClient.send(
      "/app/chat.register",
      {},
      JSON.stringify({ sender: this.login.username, type: "JOIN" })
    );
  }

  messageNotification(message) {
    if (!message.content || this.login.username === message.sender) {
      return;
    }

    let conversationList = this.shadowRoot
      .querySelector("il-sidebar")
      .shadowRoot.querySelector("il-conversation-list");

    let roomName = this.activeChatNameFormatter(message.roomName);

    if (Notification.permission === "granted") {
      let notification = new Notification(roomName, {
        body: message.content,
      });

      notification.onclick = function () {
        conversationList.selectChat(roomName);
        window.focus("/");
      };
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(function (permission) {
        if (permission === "granted") {
          let notification = new Notification(roomName, {
            body: message.content,
          });

          notification.onclick = function () {
            conversationList.selectChat(
              this.activeChatNameFormatter(message.roomName)
            );
            window.focus("/");
          };
        }
      });
    }
  }

  onMessage(payload) {
    let message = JSON.parse(payload.body);
    if (message.content) {
      if (this.activeChatName == message.roomName) {
        this.messages.push(message);
        this.update();
        this.updated();
      }
      let sidebar = this.renderRoot.querySelector(
        "main > section > il-sidebar"
      );
      sidebar.shadowRoot
        .querySelector("div > il-conversation-list")
        .setList(message);

      let conversationListElement = document
        .querySelector("body > il-app")
        .shadowRoot.querySelector("il-chat")
        .shadowRoot.querySelector("main > section > il-sidebar")
        .shadowRoot.querySelector("div > il-conversation-list");
      conversationListElement.scrollToTop();
    }

    this.messageNotification(message);
  }

  sendMessage(e) {
    this.message = e.detail.message.replaceAll("\\\n", "\n");
    const messageLines = e.detail.message.split("\n");

    for (let i = 1; i < messageLines.length; i++) {
      if (
        MarkdownService.checkList(messageLines[i]) ||
        MarkdownService.checkTitle(messageLines[i]) ||
        MarkdownService.checkTitle(messageLines[i - 1])
      )
        continue;
      messageLines[i - 1] += "\\";
    }

    this.message = messageLines.join("\n");

    let messageContent = this.message.trim();

    if (messageContent && this.stompClient) {
      const chatMessage = {
        sender: this.login.username,
        content: messageContent,
        type: "CHAT",
      };

      let activeChatName = this.activeChatNameFormatter(this.activeChatName);

      this.stompClient.send(
        `/app/chat.send${
          activeChatName != "general" ? `.${activeChatName}` : ""
        }`,
        {},
        JSON.stringify(chatMessage)
      );
    }
  }

  onError(error) {
    console.log(error);
  }

  activeChatNameFormatter(activeChatName) {
    let cookie = CookieService.getCookie();
    if (activeChatName.includes("-")) {
      activeChatName = activeChatName.split("-");
      activeChatName.splice(activeChatName.indexOf(cookie.username), 1);
      return activeChatName[0];
    }
    return activeChatName;
  }
}

customElements.define("il-chat", Chat);
