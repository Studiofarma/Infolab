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
import "./input/input-controls.js";
import "./sidebar/sidebar.js";
import "./header/chat-header.js";

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
    this.activeChatName = "general";
    this.forwardListVisibility = false;
    this.scrolledToBottom = false;
    window.addEventListener("resize", () => {
      this.scrollToBottom();
    });
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

    .messages-container {
      list-style-type: none;
      display: grid;
      grid-auto-rows: max-content;
      gap: 30px;
      width: 100%;
      height: calc(100vh - 141px);
      overflow-y: auto;
      padding: 20px;
      margin-top: 71px;
    }

    .messages-container::-webkit-scrollbar {
      width: 4px;
      margin-right: 10px;
    }

    .messages-container::-webkit-scrollbar-track {
      background-color: none;
    }

    .messages-container::-webkit-scrollbar-thumb {
      border-radius: 10px;
      background-color: rgb(54, 123, 251);
      min-height: 40px;
    }

    .message {
      display: grid;
      flex-direction: column;
      max-width: 100%;
    }

    .scroll-button {
      z-index: 9999;
      position: absolute;
      right: 20px;
      bottom: 130px;

      border-radius: 5px;
      padding: 2px;
      background-color: rgb(8, 60, 114);
      color: white;
      opacity: 0;
      transition: opacity 0.2s ease-in-out;
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

						<ul
							@scroll="${this.manageScrollButtonVisility}"
							class="messages-container"
						>
							${repeat(
								this.messages,
								(message) => message.index,
								(message, index) =>
									html` <il-message
										class="message"
										.messages=${this.messages}
										.message=${message}
										.index=${index}
									></il-message>`
							)}
						</ul>

            <il-forward-list></il-forward-list>

            <il-button-icon
              class="scroll-button"
              @click="${this.scrollToBottom}"
              content="${IconNames.scrollDownArrow}"
            ></il-button-icon>

						<il-input-controls
							class="input-controls"
							@send-message="${this.sendMessage}"
						></il-input-controls>
					</div>
				</section>
			</main>
		`;
	}

  manageScrollButtonVisility() {
    if (this.checkScrolledToBottom()) {
      this.renderRoot.querySelector(".scroll-button").style.opacity = "0";
      return;
    }
    this.renderRoot.querySelector(".scroll-button").style.opacity = "1";
  }

  async firstUpdated() {
    MessagesService.getMessagesById(
      this.login.username,
      this.login.password,
      "general"
    ).then((messages) => {
      this.messages = messages.data.reverse();

      for (var i = 0; i < this.messages.length; i++) {
        this.messages[i].index = i;
      }
    });
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

  checkScrolledToBottom() {
    try {
      let element = this.renderRoot.querySelector("ul.messages-container");
      return (
        element.scrollHeight - element.offsetHeight <= element.scrollTop + 10
      );
    } catch (error) {
      return false;
    }
  }

  scrollToBottom() {
    let element = this.renderRoot.querySelector("ul.messages-container");
    element.scrollBy({ top: element.scrollHeight - element.offsetHeight });
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

    let conversationList = document
      .querySelector("body > il-app")
      .shadowRoot.querySelector("il-chat")
      .shadowRoot.querySelector("main > section > il-sidebar")
      .shadowRoot.querySelector("div > il-conversation-list");

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

      let room = conversationListElement.convertUserToRoom(message.roomName);
      conversationListElement.onMessageInNewChat(room, message);
    }

    this.messageNotification(message);
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
