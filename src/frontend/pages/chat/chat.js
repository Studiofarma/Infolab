import { LitElement, html, css } from "lit";
import { repeat } from "lit/directives/repeat.js";
import {ref, createRef} from 'lit/directives/ref.js'

import SockJS from "sockjs-client";
import Stomp from "stompjs";

import { MessagesService } from "../../services/messages-service";

import { CookieService } from "../../services/cookie-service";

import { IconNames } from "../../enums/icon-names";

import "./message/message";
import "../../components/button-icon";
import "../../components/icon";
import "../../components/modal";
import "./input/input-controls";
import "./sidebar/sidebar";
import "./header/chat-header";
import "./empty-chat";
import { MarkdownService } from "../../services/markdown-service";

const fullScreenHeight = "100vh";

export class Chat extends LitElement {
  static properties = {
    stompClient: {},
    messages: [],
    message: "",
    nMessages: 0,
    messageToForward: "",
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
    this.activeDescription = CookieService.getCookieByKey(
      CookieService.Keys.lastDescription
    );
    this.scrolledToBottom = false;
    window.addEventListener("resize", () => {
      this.scrollToBottom();
    });

    // Refs
    this.forwardListRef = createRef()
    this.sidebarRef = createRef()
    this.scrollButtonRef = createRef()
    this.messageBoxRef = createRef()
    this.inputControlsRef = createRef()
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
      background: rgb(247, 247, 247);
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
      background-color: rgb(8, 60, 114);
      color: white;
      opacity: 0;
      transition: opacity 0.2s ease-in-out;
    }

    .message-box::-webkit-scrollbar {
      width: 4px;
      margin-right: 10px;
    }

    .message-box::-webkit-scrollbar-track {
      background-color: none;
    }

    .message-box::-webkit-scrollbar-thumb {
      border-radius: 10px;
      background-color: rgb(54, 123, 251);
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
          ${ref(this.sidebarRef)}
            @update-message="${this.updateMessages}"
            @change-conversation=${this.setActiveChat}
            .login=${this.login}
          ></il-sidebar>

          <div class="chat">
            <il-chat-header
              userName=${this.login.username}
              activeDescription=${this.activeDescription ?? ""}
            ></il-chat-header>

            ${this.activeChatName !== ""
              ? html` <ul
                    @scroll="${this.manageScrollButtonVisility}"
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
                          @forward-message=${this.openForwardMenu}
                          @go-to-chat=${this.goToChat}
                        ></il-message>`
                    )}
                  </ul>

                  <il-modal
                    theme="forward-blue"
                    ${ref(this.forwardListRef)}
                  >
                    <il-conversation-list
                      @change-conversation=${this.forwardMessage}
                    ></il-conversation-list>
                  </il-modal>

                  <il-button-icon
                  ${ref(this.scrollButtonRef)}
                    style="bottom: 120px"
                    class="scroll-button"
                    @click="${this.scrollToBottom}"
                    content="${IconNames.scrollDownArrow}"
                  ></il-button-icon>

                  <il-input-controls
                    @send-message=${this.sendMessage}
                    @text-editor-resized=${this.textEditorResized}
                  ></il-input-controls>`
              : html`<il-empty-chat></il-empty-chat>`}
          </div>
        </section>
      </main>
    `;
  }

  openForwardMenu(event) {
    this.messageToForward = event.detail.messageToForward;
    this.forwardListRef.value.ilDialogRef.value.isOpened = true;
  }

  forwardMessage(event) {
    // chiudo il menù di inoltro
    this.forwardListRef.value.ilDialogRef.value.isOpened = false;

    // apro la chat a cui devo inoltrare
    this.setActiveChat(event);
    this.updateMessages(event);

    this.sidebarRef.value.sidebarListRef.value.activeChatName = event.detail.conversation.roomName;
    this.sidebarRef.value.sidebarListRef.value.activeDescription =
      event.detail.conversation.description;

    // invio il messaggio
    this.sendMessage({ detail: { message: this.messageToForward } });
  }

  goToChat(event) {

    let list = this.sidebarRef.value.sidebarListRef.value.conversationList;

    let newList = this.sidebarRef.value.sidebarListRef.value.newConversationList;

    let index = list.findIndex(
      (elem) => elem.description === event.detail.description
    );

    if (index === -1) {
      index = newList.findIndex(
        (elem) => elem.description === event.detail.description + "\n"
      );

      console.log(index);
      this.sidebarRef.value.sidebarListRef.value.activeChatName = newList[index].roomName;
      this.sidebarRef.value.sidebarListRef.value.activeDescription = newList[index].description;

      this.updateMessages({ detail: { conversation: newList[index] } });
    } else {
      this.sidebarRef.value.sidebarListRef.value.activeChatName = list[index].roomName;
      this.sidebarRef.value.sidebarListRef.value.activeDescription = list[index].description;

      this.updateMessages({ detail: { conversation: list[index] } });
    }
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
      e.detail.conversation.roomName
    ).then((messages) => {
      this.messages = messages.data.reverse();

      for (var i = 0; i < this.messages.length; i++) {
        this.messages[i].index = i;
      }
    });
    this.activeChatName = e.detail.conversation.roomName;
    this.activeDescription = e.detail.conversation.description;
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
      this.scrollButtonRef.value.style.opacity = "0";
      return;
    }
    this.scrollButtonRef.value.style.opacity = "1";
  }

  checkScrolledToBottom() {
    try {
      return (
        this.messageBoxRef.value.scrollHeight - this.messageBoxRef.value.offsetHeight <= this.messageBoxRef.value.scrollTop + 10
      );
    } catch (error) {
      return false;
    }
  }

  textEditorResized(event) {

    this.scrollButtonRef.value.style.bottom = `${event.detail.height + 100}px`;
    this.messageBoxRef.value.style.height = `calc(${fullScreenHeight} - ${
      event.detail.height + 150
    }px)`;
  }
  scrollToBottom() {
    if (this.activeChatName === "") return;

    this.messageBoxRef.value.scrollTo({ top: this.messageBoxRef.value.scrollHeight });
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


    let roomName = this.activeDescription;

    if (Notification.permission === "granted") {
      let notification = new Notification(roomName, {
        body: message.content,
      });

      notification.onclick = function () {
        this.sidebarRef.value.sidebarListRef.value.selectChat(roomName)
        window.focus("/");
      };
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(function (permission) {
        if (permission === "granted") {
          let notification = new Notification(roomName, {
            body: message.content,
          });

          notification.onclick = function () {
            this.sidebarRef.value.sidebarListRef.value.selectChat(message, this.activeDescription);
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
    }

    // riordino le conversazioni con una funzione contenuta in il-conversation-list che compara il timestamp

    if (message.content !== null) this.sidebarRef.value.sidebarListRef.value.setList(message);

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

      this.stompClient.send(
        `/app/chat.send${
          this.activeDescription != "Generale"
            ? `.${this.activeDescription}`
            : ""
        }`,
        {},
        JSON.stringify(chatMessage)
      );
    }
  }

  onError(error) {
    console.log(error);
  }

  setActiveChat(event) {
    this.activeChatName = event.detail.conversation.roomName;
    this.activeDescription = event.detail.conversation.description;
  }
}

customElements.define("il-chat", Chat);
