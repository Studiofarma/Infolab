import { LitElement, html, css } from "lit";
import { when } from "lit/directives/when.js";
import { createRef, ref } from "lit/directives/ref.js";

import SockJS from "sockjs-client";
import Stomp from "stompjs";

import { MessagesService } from "../../services/messages-service";
import { CookieService } from "../../services/cookie-service";
import { ThemeColorService } from "../../services/theme-color-service";

import { IconNames } from "../../enums/icon-names";
import { TooltipTexts } from "../../enums/tooltip-texts";
import { ThemeCSSVariables } from "../../enums/theme-css-variables";

import "./message/message";
import "../../components/icon";
import "../../components/modal";
import "./input/input-controls";
import "./sidebar/conversation/conversation-list";
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
    this.cookie = CookieService.getCookie();
    this.scrolledToBottom = false;
    window.addEventListener("resize", () => {
      this.scrollToBottom();
    });

    // Refs
    this.forwardListRef = createRef();
    this.conversationListRef = createRef();
    this.scrollButtonRef = createRef();
    this.inputControlsRef = createRef();
    this.messagesListRef = createRef();
    this.snackbarRef = createRef();
    this.deletionConfirmationDialogRef = createRef();
    this.headerRef = createRef();
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
      ${ThemeColorService.getThemeVariables()};
      color: ${ThemeCSSVariables.text};
    }

    main {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      min-height: 100%;
      background: ${ThemeCSSVariables.chatBackground};
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

    il-input-controls {
      margin-top: auto;
    }

    il-button-icon {
      z-index: 9999;
      position: absolute;
      right: 20px;
      border-radius: 5px;
      padding: 2px;
      color: white;
      visibility: hidden;
      transition: opacity 0.2s ease-in-out;
      box-shadow: ${ThemeCSSVariables.boxShadowSecondary} 0px 1px 4px;
      background: ${ThemeCSSVariables.messageMenuBg};
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
    }

    .side-bar {
      background: ${ThemeCSSVariables.sidebarBg};
      color: white;
      display: flex;
      flex-direction: column;
      height: 100vh;
      width: 350px;
      box-shadow: 2px 0 8px ${ThemeCSSVariables.boxShadowPrimary};
      z-index: 1100;
    }

    .conversation-list {
      margin: 0 5px 0 7px;
      height: 100%;
      display: flex;
      flex-direction: column;
    }
  `;

  render() {
    return html`
      <main>
        <section>
          <div class="side-bar">
            <il-conversation-list
              ${ref(this.conversationListRef)}
              id="#sidebar"
              class="conversation-list"
              @update-message=${this.updateMessages}
              @change-conversation=${(event) => {
                this.setActiveChat(event);
                this.focusOnEditor(event);
              }}
            ></il-conversation-list>
          </div>

          <div class="chat">
            <il-chat-header
              ${ref(this.headerRef)}
              userName=${this.login.username}
              activeDescription="${this.activeDescription ?? ""}"
            ></il-chat-header>
            ${when(
              this.activeChatName === "",
              () => html`<il-empty-chat></il-empty-chat>`,
              () => html` <il-messages-list
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
                          id="forwardList"
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
                          this.setDeletionConfirmationDialogRefIsOpened(false)}
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
            )}
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

  getconversationListRefActiveChatName() {
    return this.conversationListRef.value?.getActiveChatName();
  }

  setconversationListRefActiveChatName(value) {
    this.conversationListRef.value?.setActiveChatName(value);
  }

  getconversationListRefActiveDescription() {
    return this.conversationListRef.value?.getActiveDescription();
  }

  setconversationListRefActiveDescription(value) {
    this.conversationListRef.value?.setActiveDescription(value);
  }

  getconversationListRefConversationList() {
    return [...this.conversationListRef.value?.getConversationList()];
  }

  getconversationListRefNewConversationList() {
    return [...this.conversationListRef.value?.getNewConversationList()];
  }

  setDeletionConfirmationDialogRefIsOpened(value) {
    this.deletionConfirmationDialogRef.value?.setDialogRefIsOpened(value);
  }

  // -------------------------------------

  updateLastMessageInConversationList(message) {
    this.conversationListRef.value?.updateLastMessage(message);
  }

  multipleForward(event) {
    if (event.detail.list[0] == undefined) return;

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
    this.updateMessages(event).then(() => {
      // invio il messaggio
      this.sendMessage({ detail: { message: this.messageToForward } });
    });

    this.setconversationListRefActiveChatName(
      event.detail.conversation.roomName
    );
    this.setconversationListRefActiveDescription(
      event.detail.conversation.description
    );

    this.conversationListRef.value?.requestUpdate();
    this.requestUpdate();
  }

  goToChat(event) {
    this.conversationListRef.value?.changeRoom(
      new CustomEvent("go-to-chat"),
      this.conversationListRef.value?.findConversation(event.detail.user)
    );
  }

  askDeletionConfirmation(event) {
    this.indexToBeDeleted = event.detail.messageIndex;
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

    if (index === this.messages.length - 1)
      this.updateLastMessageInConversationList(message);

    this.messagesListRef.value?.requestUpdate();
  }

  focusOnEditor(event) {
    this.inputControlsRef.value?.focusEditor();
  }

  async firstUpdated() {
    if (this.activeChatName === "") return;

    this.messages = (
      await MessagesService.getMessagesByRoomName(this.activeChatName)
    ).reverse();
  }

  async updateMessages(e) {
    this.messages = (
      await MessagesService.getMessagesByRoomName(
        e.detail.conversation.roomName
      )
    ).reverse();

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
        this.conversationListRef.value.sidebarListRef.value.selectChat(
          roomName
        );
        window.focus("/");
      };
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(function (permission) {
        if (permission === "granted") {
          let notification = new Notification(roomName, {
            body: message.content,
          });

          notification.onclick = function () {
            this.conversationListRef.value.sidebarListRef.value.selectChat(
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

      this.updateLastMessageInConversationList(message);
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
    this.headerRef.value?.setConversation(event.detail.conversation);
    this.headerRef.value?.setOtherUser(event.detail.user);
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
