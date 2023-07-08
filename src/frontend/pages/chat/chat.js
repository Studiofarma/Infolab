import { LitElement, html, css } from "lit";
import { when } from "lit/directives/when.js";
import { createRef, ref } from "lit/directives/ref.js";

import SockJS from "sockjs-client";
import Stomp from "stompjs";

import { MessagesService } from "../../services/messages-service";
import { CookieService } from "../../services/cookie-service";

import { IconNames } from "../../enums/icon-names";
import { TooltipTexts } from "../../enums/tooltip-texts";

import "./message/message";
import "../../components/icon";
import "../../components/modal";
import "./input/input-controls";
import "./sidebar/sidebar";
import "./header/chat-header";
import "./empty-chat";
import "./message/messages-list";
import "../../components/snackbar";
import "../../components/button-icon";

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
    this.forwardListRef = createRef();
    this.sidebarRef = createRef();
    this.scrollButtonRef = createRef();
    this.messageBoxRef = createRef();
    this.inputControlsRef = createRef();
    this.messagesListRef = createRef();
    this.snackbarRef = createRef();
    this.deletionConfirmationDialogRef = createRef();
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

    il-button-icon {
      z-index: 9999;
      position: absolute;
      right: 20px;
      border-radius: 5px;
      padding: 2px;
      background-color: #ffffff;
      color: white;
      visibility: hidden;
      transition: opacity 0.2s ease-in-out;
      box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
    }

    .deletion-confirmation {
      padding: 10px;
    }

    .deletion-confirmation-buttons {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
    }

    .forward-list {
      width: 400px;
      height: 100%;
      color: white;
    }
  `;

  render() {
    return html`
      <main>
        <section>
          <il-sidebar
            ${ref(this.sidebarRef)}
            @update-message="${this.updateMessages}"
            @change-conversation=${(event) => {
              this.setActiveChat(event);
              this.focusOnEditor(event);
            }}
            .login=${this.login}
          ></il-sidebar>

          <div class="chat">
            <il-chat-header
              userName=${this.login.username}
              activeDescription="${this.activeDescription ?? ""}"
            ></il-chat-header>
            ${this.activeChatName !== ""
              ? html` <il-messages-list
                    ${ref(this.messagesListRef)}
                    @scroll=${this.manageScrollButtonVisility}
                    .messages=${this.messages}
                    .activeChatName=${this.activeChatName}
                    .activeDescription=${this.activeDescription}
                    @forward-message=${this.openForwardMenu}
                    @go-to-chat=${this.goToChat}
                    @message-copy=${() =>
                      this.snackbarRef.value.openSnackbar(
                        "MESSAGGIO COPIATO",
                        "info",
                        2000
                      )}
                    @edit-message=${this.editMessage}
                    @delete-message=${this.askDeletionConfirmation}
                  ></il-messages-list>

                  <il-modal
                    @modal-closed=${() => this.requestUpdate()}
                    ${ref(this.forwardListRef)}
                  >
                    <div class="forward-list">
                      ${when(
                        this.getForwardListRefIsOpened(),
                        () =>
                          html`<il-conversation-list
                            isForwardList="true"
                            @multiple-forward=${this.multipleForward}
                            @change-conversation=${(event) => {
                              this.forwardMessage(event);
                              this.focusOnEditor(event);
                            }}
                          ></il-conversation-list>`
                      )}
                    </div>
                  </il-modal>

                  <il-modal
                    ${ref(this.deletionConfirmationDialogRef)}
                    @modal-closed=${() => this.requestUpdate()}
                  >
                    <div class="deletion-confirmation">
                      <h3>Eliminazione messaggio</h3>
                      <br />
                      <p>Confermare l'eliminazione del messaggio?</p>
                      <br />
                      <div class="deletion-confirmation-buttons">
                        <il-button-text
                          text="Annulla"
                          @click=${() =>
                            this.setDeletionConfirmationDialogRefIsOpened(
                              false
                            )}
                        ></il-button-text>
                        <il-button-text
                          color="#DC2042"
                          @click=${this.deleteMessage}
                          text="Elimina"
                        ></il-button-text>
                      </div>
                    </div>
                  </il-modal>

                  <il-button-icon
                    ${ref(this.scrollButtonRef)}
                    style="bottom: 120px"
                    @click="${this.scrollToBottom}"
                    .content=${IconNames.scrollDownArrow}
                    .tooltipText=${TooltipTexts.scrollToBottom}
                  ></il-button-icon>

                  <il-input-controls
                    ${ref(this.inputControlsRef)}
                    @send-message=${this.sendMessage}
                    @text-editor-resized=${this.textEditorResized}
                    @confirm-edit=${this.confirmEdit}
                  ></il-input-controls>`
              : html`<il-empty-chat></il-empty-chat>`}
          </div>
        </section>
        <il-snackbar ${ref(this.snackbarRef)}></il-snackbar>
      </main>
    `;
  }

  // getters & setters

  getForwardListRefIsOpened() {
    return this.forwardListRef.value?.getDialogRefIsOpened();
  }

  setForwardListRefIsOpened(value) {
    this.forwardListRef.value?.setDialogRefIsOpened(value);
  }

  getSidebarRefActiveChatName() {
    return this.sidebarRef.value?.getSidebarListRefActiveChatName();
  }

  setSidebarRefActiveChatName(value) {
    this.sidebarRef.value?.setSidebarListRefActiveChatName(value);
  }

  getSidebarRefActiveDescription() {
    return this.sidebarRef.value?.getSidebarListRefActiveDescription();
  }

  setSidebarRefActiveDescription(value) {
    this.sidebarRef.value?.setSidebarListRefActiveDescription(value);
  }

  getSidebarRefConversationList() {
    return [...this.sidebarRef.value?.getSidebarListRefConversationList()];
  }

  getSidebarRefNewConversationList() {
    return [...this.sidebarRef.value?.getSidebarListRefNewConversationList()];
  }

  setDeletionConfirmationDialogRefIsOpened(value) {
    this.deletionConfirmationDialogRef.value?.setDialogRefIsOpened(value);
  }

  // -------------------------------------

  setList(message) {
    this.sidebarRef.value?.setList(message);
  }

  multipleForward(event) {
    if (event.detail.list[0] == undefined) return;

    if (event.detail.list.length == 1) {
      this.forwardMessage(event);
    } else {
      const chatMessage = {
        sender: this.login.username,
        content: this.messageToForward,
        type: "CHAT",
      };

      event.detail.list.forEach((room) => {
        let chatName = this.activeChatNameFormatter(room);
        this.stompClient.send(
          `/app/chat.send${room != "general" ? `.${chatName}` : ""}`,
          {},
          JSON.stringify(chatMessage)
        );
      });
    }

    this.setForwardListRefIsOpened(false);
  }

  openForwardMenu(event) {
    this.messageToForward = event.detail.messageToForward;
    this.setForwardListRefIsOpened(true);
    this.requestUpdate();
  }

  forwardMessage(event) {
    // chiudo il menù di inoltro
    this.setForwardListRefIsOpened(false);

    // apro la chat a cui devo inoltrare
    this.setActiveChat(event);
    this.updateMessages(event);

    this.setSidebarRefActiveChatName(event.detail.conversation.roomName);
    this.setSidebarRefActiveDescription(event.detail.conversation.description);

    // invio il messaggio
    this.sendMessage({ detail: { message: this.messageToForward } });

    this.requestUpdate();
  }

  goToChat(event) {
    let list = this.getSidebarRefConversationList();

    let newList = this.getSidebarListRefNewConversationList();

    let index = list.findIndex((elem) => {
      return this.isUsernameInRoomName(elem.roomName, event.detail.description);
    });

    if (index === -1) {
      index = newList.findIndex((elem) => {
        return this.isUsernameInRoomName(
          elem.roomName,
          event.detail.description
        );
      });

      this.setSidebarRefActiveChatName(newList[index].roomName);
      this.setSidebarRefActiveDescription(newList[index].description);

      this.updateMessages({ detail: { conversation: newList[index] } });
    } else {
      this.setSidebarRefActiveChatName(list[index].roomName);
      this.setSidebarRefActiveDescription(list[index].description);

      this.updateMessages({ detail: { conversation: list[index] } });
    }
  }

  askDeletionConfirmation(event) {
    this.indexToBeDeleted = event.detail.index;
    this.setDeletionConfirmationDialogRefIsOpened(true);
  }

  deleteMessage() {
    this.messages[this.indexToBeDeleted] = {
      ...this.messages[this.indexToBeDeleted],
      hasBeenDeleted: true,
    };
    this.messagesListRef.value?.requestUpdate();
    this.setDeletionConfirmationDialogRefIsOpened(false);
  }

  editMessage(event) {
    this.inputControlsRef.value?.editMessage(event.detail);
  }

  confirmEdit(event) {
    let message = event.detail.message;
    let index = event.detail.index;

    this.messages[index] = {
      ...message,
      content: message.content,
      hasBeenEdited: true,
    };

    if (index === this.messages.length - 1) this.setList(message);

    this.messagesListRef.value?.requestUpdate();
  }

  // TODO: rimuovere quando gli utenti in una stanza arriveranno dal backend
  isUsernameInRoomName(roomName, username) {
    let names = roomName.split("-");
    return names.includes(username);
  }

  focusOnEditor(event) {
    this.inputControlsRef.value?.focusEditor();
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

    this.inputControlsRef?.value?.focusEditor();
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
      this.scrollButtonRef.value.style.visibility = "hidden";
      return;
    }

    this.scrollButtonRef.value.style.visibility = "visible";
  }

  checkScrolledToBottom() {
    return this.messagesListRef.value.checkScrolledToBottom();
  }

  textEditorResized(event) {
    this.scrollButtonRef.value.style.bottom = `${event.detail.height + 100}px`;
    this.messagesListRef.value.textEditorResized(event);
  }

  scrollToBottom() {
    this.messagesListRef.value?.scrollToBottom();
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
        this.sidebarRef.value.sidebarListRef.value.selectChat(roomName);
        window.focus("/");
      };
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(function (permission) {
        if (permission === "granted") {
          let notification = new Notification(roomName, {
            body: message.content,
          });

          notification.onclick = function () {
            this.sidebarRef.value.sidebarListRef.value.selectChat(
              message,
              this.activeDescription
            );
            window.focus("/");
          };
        }
      });
    }
  }

  onMessage(payload) {
    let message = JSON.parse(payload.body);

    if (message.content !== null) {
      // TODO: rimuovere questa riga quando hasBeenEdited verrà dal db
      message.hasBeenEdited = message.hasBeenEdited
        ? message.hasBeenEdited
        : false;

      message.hasBeenDeleted = message.hasBeenDeleted
        ? message.hasBeenDeleted
        : false;

      if (this.activeChatName == message.roomName) {
        this.messages.push(message);
        this.messagesListRef.value.requestUpdate();
        this.requestUpdate();
      }

      this.setList(message);
    }

    this.messageNotification(message);
  }

  buildMessageAndSend(messageContent, type) {
    if (messageContent && this.stompClient) {
      const chatMessage = {
        sender: this.login.username,
        content: messageContent,
        type: type,
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

  sendMessage(event) {
    this.buildMessageAndSend(event.detail.message, "CHAT");
  }

  onError(error) {
    console.log(error);
  }

  setActiveChat(event) {
    this.activeChatName = event.detail.conversation.roomName;
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
