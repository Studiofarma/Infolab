import { html, css } from "lit";
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
import { MessageStatuses } from "../../enums/message-statuses";
import { WebSocketMessageTypes } from "../../enums/websocket-message-types";
import { GenericConstants } from "../../enums/generic-constants";

import { ConversationDto } from "../../models/conversation-dto";
import { BaseComponent } from "../../components/base-component";

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
import { WebSocketMessageDto } from "../../models/websocket-message-dto";
import { MessageDto } from "../../models/message-dto";
import { ConversationService } from "../../services/conversations-service";
import { CommandsService } from "../../services/commands-service";
import { UsersService } from "../../services/users-service";

export class Chat extends BaseComponent {
  static properties = {
    stompClient: {},
    messages: [],
    messageToForward: "",
    scrolledToBottom: false,
    hasMoreNext: { type: Boolean },
    hasFetchedNewMessages: { type: Boolean },
    firstNotReadMessage: { type: MessageDto },
    hasFetchedBeforeAndAfter: { type: Boolean },

    login: { type: Object },
    activeChatName: { type: String },
    activeConversation: { type: ConversationDto },
    messages: { type: Array },
    messageToBeDeleted: { type: MessageDto },

    canFetchLoggedUser: { type: Boolean },
  };

  constructor() {
    super();

    this.login = {
      username: "",
      password: "",
      headerName: "",
      token: "",
    };
    this.messages = [];
    this.scrolledToBottom = false;
    this.hasMoreNext = false;
    this.hasMorePrev = false;
    this.hasFetchedNewMessages = false;
    this.hasFetchedAfterDate = false;
    this.hasFetchedBeforeAndAfter = false;
    this.firstNotReadMessage = null;

    this.canFetchLoggedUser = false;

    this.activeChatName =
      CookieService.getCookieByKey(CookieService.Keys.lastChat) || "";

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

  async connectedCallback() {
    super.connectedCallback();
    this.createSocket();
    await UsersService.getLoggedUser();
    this.canFetchLoggedUser = true;

    window.addEventListener("beforeunload", () => {
      if (this.stompClient) {
        const quitMessage = new WebSocketMessageDto({
          type: WebSocketMessageTypes.quit,
          quit: {
            sender: this.login.username,
          },
        });

        this.stompClient.send(
          "/app/chat.unregister",
          {},
          JSON.stringify(quitMessage)
        );
      }
    });
  }

  updated(changedProperties) {
    if (changedProperties.has("hasFetchedBeforeAndAfter")) {
      if (this.hasFetchedBeforeAndAfter === true && this.firstNotReadMessage) {
        window.requestAnimationFrame(() => {
          this.messagesListRef.value?.scrollMessageIntoView(
            this.firstNotReadMessage
          );
          this.hasFetchedBeforeAndAfter = false;
        });
      }
    }

    if (changedProperties.has("messages")) {
      if (changedProperties.has("hasFetchedNewMessages")) {
        // this.messagesListRef.value?.updateScrollPosition();
        this.hasFetchedNewMessages = false;
      } else if (changedProperties.has("hasFetchedAfterDate")) {
        if (this.hasFetchedAfterDate) {
          this.hasFetchedAfterDate = false;
        }
      } else {
        window.requestAnimationFrame(() => {
          this.scrollToBottom();
        });
      }
    }
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
      color: ${ThemeCSSVariables.text};
    }

    .deletion-confirmation-buttons {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
    }

    .forward-list {
      width: 400px;
      height: calc(100vh - 80px);
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
              activeChatName=${this.activeChatName}
              @il:messages-fetched=${this
                .fetchMessagesAfterAndBeforeLastDownload}
              @il:conversation-changed=${(event) => {
                this.setActiveChat(event);
                this.insertStoredTextInEditor();
                this.focusEditorAndMoveCaretToEnd(event);
                this.firstNotReadMessage = null;
              }}
              @il:conversation-is-going-to-change=${this
                .ifIsEditingExitEditMode}
            ></il-conversation-list>
          </div>

          <div class="chat">
            <il-chat-header
              ${ref(this.headerRef)}
              userName=${this.login.username}
              canFetchLoggedUser=${this.canFetchLoggedUser}
            ></il-chat-header>
            ${when(
              this.activeChatName === "",
              () => html`<il-empty-chat></il-empty-chat>`,
              () =>
                html` <il-messages-list
                    ${ref(this.messagesListRef)}
                    @scroll=${this.manageScrollButtonVisility}
                    .messages=${this.messages}
                    .activeChatName=${this.activeChatName}
                    .activeConversation=${this.activeConversation}
                    .roomType=${this.roomType}
                    .hasMoreNext=${this.hasMoreNext}
                    .hasMorePrev=${this.hasMorePrev}
                    @il:message-forwarded=${this.openForwardMenu}
                    @il:went-to-chat=${this.wentToChatHandler}
                    @il:message-copied=${() =>
                      this.snackbarRef.value.openSnackbar(
                        "MESSAGGIO COPIATO",
                        "info",
                        2000
                      )}
                    @il:message-edited=${this.editMessage}
                    @il:message-deleted=${this.askDeletionConfirmation}
                    @il:updated-next=${this.fetchNextMessages}
                    @il:updated-prev=${this.fetchPrevMessages}
                  ></il-messages-list>

                  <il-modal
                    @modal-closed=${this.handleModalClosed}
                    ${ref(this.forwardListRef)}
                  >
                    <div class="forward-list">
                      ${when(
                        this.getForwardListRefIsOpened(),
                        () =>
                          html`<il-conversation-list
                            id="forwardList"
                            isForwardList="true"
                            @il:multiple-forwarded=${this.multipleForward}
                            @il:conversation-changed=${(event) => {
                              this.forwardMessage(event);
                              this.insertStoredTextInEditor();
                              this.focusEditorAndMoveCaretToEnd(event);
                            }}
                            @il:conversation-is-going-to-change=${this
                              .ifIsEditingExitEditMode}
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
                    @click="${this.scrollToBottomAndRefetch}"
                    .content=${IconNames.scrollDownArrow}
                    .tooltipText=${TooltipTexts.scrollToBottom}
                  ></il-button-icon>

                  <il-input-controls
                    ${ref(this.inputControlsRef)}
                    @il:message-sent=${this.sendMessage}
                    @il:text-editor-resized=${this.handleTextEditorResized}
                    @il:edit-confirmed=${this.confirmEdit}
                  ></il-input-controls>`
            )}
          </div>
        </section>
        <il-snackbar ${ref(this.snackbarRef)}></il-snackbar>
      </main>
    `;
  }

  //#region getters & setters

  getForwardListRefIsOpened() {
    return this.forwardListRef.value?.getDialogRefIsOpened();
  }

  setForwardListRefIsOpened(value) {
    this.forwardListRef.value?.setDialogRefIsOpened(value);
    if (value === false) {
      ConversationService.resetAfterLink(ConversationService.forwardList);
    }
  }

  getconversationListRefActiveChatName() {
    return this.conversationListRef.value?.getActiveChatName();
  }

  setconversationListRefActiveChatName(value) {
    this.conversationListRef.value?.setActiveChatName(value);
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

  //#endregion

  handleModalClosed() {
    this.setForwardListRefIsOpened(false);
  }

  async updateLastMessageInConversationList(message) {
    await this.conversationListRef.value?.updateLastMessage(message);
  }

  async updateEditedOrDeletedLastMessageIfItIsLastMessageOfConversation(
    editedMessage
  ) {
    await this.conversationListRef.value?.updateLastMessageIfItIsLastMessageOfConversation(
      editedMessage
    );
  }

  multipleForward(event) {
    if (event.detail.list[0] == undefined) return;

    const chatMessage = new MessageDto({
      sender: this.login.username,
      content: this.messageToForward,
    });

    event.detail.list.forEach((room) => {
      let chatName = this.formatActiveChatName(room);
      this.stompClient.send(
        `/app/chat.send${room != "general" ? `.${chatName}` : ""}`,
        {},
        JSON.stringify(
          new WebSocketMessageDto({
            type: WebSocketMessageTypes.chat,
            chat: chatMessage,
          })
        )
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
    this.fetchMessagesLast(event).then(() => {
      // invio il messaggio
      this.sendMessage({ detail: { message: this.messageToForward } });
    });

    this.setconversationListRefActiveChatName(
      event.detail.conversation.roomName
    );

    this.conversationListRef.value?.requestUpdate();
    this.requestUpdate();
  }

  wentToChatHandler(event) {
    this.conversationListRef.value?.changeRoom(
      new CustomEvent(event.type),
      this.conversationListRef.value?.findConversationByUsername(
        event.detail.user
      )
    );
  }

  askDeletionConfirmation(event) {
    this.messageToBeDeleted = event.detail.messageToDelete;
    this.setDeletionConfirmationDialogRefIsOpened(true);
  }

  deleteMessage() {
    let message = new WebSocketMessageDto({
      type: WebSocketMessageTypes.delete,
      delete: this.messageToBeDeleted,
    });

    let activeChatName = this.formatActiveChatName(this.activeChatName);

    if (this.stompClient) {
      this.stompClient.send(
        `/app/chat.delete${
          activeChatName != "general" ? `.${activeChatName}` : ""
        }`,
        undefined,
        JSON.stringify(message)
      );
    }

    this.setDeletionConfirmationDialogRefIsOpened(false);
  }

  editMessage(event) {
    this.inputControlsRef.value?.editMessage(event.detail);
  }

  confirmEdit(event) {
    let message = event.detail.message;

    let editedMessage = new WebSocketMessageDto({
      type: WebSocketMessageTypes.edit,
      edit: {
        id: message.id,
        content: message.content,
        roomName: message.roomName,
        sender: this.login.username,
        timestamp: message.timestamp,
      },
    });

    let activeChatName = this.formatActiveChatName(this.activeChatName);

    if (this.stompClient) {
      this.stompClient.send(
        `/app/chat.edit${
          activeChatName != "general" ? `.${activeChatName}` : ""
        }`,
        undefined,
        JSON.stringify(editedMessage)
      );
    }
  }

  focusEditorAndMoveCaretToEnd() {
    this.inputControlsRef.value?.focusEditorAndMoveCaretToEnd();
  }

  insertStoredTextInEditor() {
    this.inputControlsRef.value?.insertStoredTextInEditor();
  }

  ifIsEditingExitEditMode() {
    this.inputControlsRef.value?.ifIsEditingExitEditMode();
  }

  async fetchMessagesLast(e) {
    this.hasMoreNext = false;

    let roomName = e?.detail?.conversation?.roomName;
    if (!roomName) {
      const cookie = CookieService.getCookie();
      roomName = cookie.lastChat;
    }

    this.messages = (
      await MessagesService.getNextByRoomName(roomName)
    ).reverse();

    if (this.messages.length === MessagesService.pageSize) {
      this.hasMoreNext = true;
    }

    if (e?.detail?.conversation) {
      this.activeChatName = e.detail.conversation.roomName;
      this.activeConversation = new ConversationDto({
        ...e.detail.conversation,
      });

      this.focusEditorAndMoveCaretToEnd();
    }
  }

  async fetchMessagesAfterAndBeforeLastDownload(e) {
    this.messagesListRef.value?.setInfiniteScrollIsLoadBlocked(true);

    await this.fetchMessagesAfterLastDownload(e);

    let firstNotReadMessage = this.messages[0];

    await this.fetchNextMessages(e);

    this.firstNotReadMessage = firstNotReadMessage;
    this.hasFetchedBeforeAndAfter = true;
    this.requestUpdate("hasFetchedBeforeAndAfter", false);
  }

  async fetchMessagesAfterLastDownload(e) {
    if (e.detail.conversation.unreadMessages > 0) {
      this.hasMoreNext = true;
      this.hasMorePrev = false;

      let after;
      if (!e.detail.conversation.lastReadTimestamp) {
        after = this.toISOStringWithTimezone(new Date(1));
      } else {
        after = e.detail.conversation.lastReadTimestamp.replace(" ", "T");
      }

      this.messages = (
        await MessagesService.getPrevByRoomName(
          e.detail.conversation.roomName,
          after
        )
      ).reverse();

      let ids = [];

      this.messages.forEach((message) => {
        ids.push(message.id);
      });

      CommandsService.setMessagesAsRead(ids);

      if (this.messages.length === MessagesService.pageSize) {
        this.hasMorePrev = true;
      }

      this.activeChatName = e.detail.conversation.roomName;
      this.activeDescription = e.detail.conversation.description;

      this.hasFetchedAfterDate = true;

      this.requestUpdate("hasFetchedAfterDate", false);

      if (e.detail.conversation) {
        this.activeChatName = e.detail.conversation.roomName;
        this.activeConversation = new ConversationDto({
          ...e.detail.conversation,
        });
      }

      this.focusEditorAndMoveCaretToEnd();
    } else {
      this.fetchMessagesLast(e);
    }
  }

  async fetchNextMessages(e) {
    if (this.hasMoreNext) {
      let roomName = e?.detail?.conversation?.roomName;

      if (!roomName) {
        const cookie = CookieService.getCookie();
        roomName = cookie.lastChat;
      }

      let before = null;
      if (this.messages) {
        before = this.messages[0].timestamp.replace(" ", "T");
      }

      let nextMessages = (
        await MessagesService.getNextByRoomName(roomName, before)
      ).reverse();

      if (nextMessages.length === 0) {
        this.hasMoreNext = false;
      } else {
        this.messages = [...nextMessages, ...this.messages];
        this.hasFetchedNewMessages = true;
      }
    }
  }

  async fetchPrevMessages(e) {
    if (this.hasMorePrev) {
      let roomName = e?.detail?.conversation?.roomName;

      if (!roomName) {
        const cookie = CookieService.getCookie();
        roomName = cookie.lastChat;
      }

      let after = null;
      if (this.messages) {
        let milliseconds = Date.parse(
          this.messages[this.messages.length - 1].timestamp
        );

        after = this.toISOStringWithTimezone(new Date(milliseconds));
      }

      let prevMessages = (
        await MessagesService.getPrevByRoomName(roomName, after)
      ).reverse();

      let ids = [];
      prevMessages.forEach((message) => {
        ids.push(message.id);
      });

      if (prevMessages.length === 0) {
        this.hasMorePrev = false;
      } else {
        CommandsService.setMessagesAsRead(ids);
        this.messages = [...this.messages, ...prevMessages];
        this.hasFetchedNewMessages = true;
      }
    }
  }

  toISOStringWithTimezone(date) {
    const pad = (n) => `${Math.floor(Math.abs(n))}`.padStart(2, "0");
    const padMillis = (n) => `${Math.floor(Math.abs(n))}`.padStart(3, "00");
    return (
      date.getFullYear() +
      "-" +
      pad(date.getMonth() + 1) +
      "-" +
      pad(date.getDate()) +
      "T" +
      pad(date.getHours()) +
      ":" +
      pad(date.getMinutes()) +
      ":" +
      pad(date.getSeconds()) +
      "." +
      padMillis(date.getMilliseconds())
    );
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
    if (this.isScrolledToBottom()) {
      this.scrollButtonRef.value.style.visibility = "hidden";
      return;
    }

    this.scrollButtonRef.value.style.visibility = "visible";
  }

  isScrolledToBottom() {
    return this.messagesListRef.value.isScrolledToBottom();
  }

  handleTextEditorResized(event) {
    this.scrollButtonRef.value.style.bottom = `${event.detail.height + 100}px`;
    this.messagesListRef.value?.textEditorResized(event);
  }

  scrollToBottom() {
    this.messagesListRef.value?.scrollToBottom();
  }

  async scrollToBottomAndRefetch() {
    if (this.hasMorePrev) {
      await this.fetchMessagesLast();
      CommandsService.setAllMessagesAsRead();
    }
    this.scrollToBottom();
  }

  onConnect() {
    this.stompClient.subscribe("/topic/public", async (payload) => {
      await this.onMessage(payload);
    });

    // fixare questo
    this.stompClient.subscribe(
      "/user/topic/me",
      async (payload) => await this.onMessage(payload)
    );

    this.stompClient.subscribe(
      `/queue/${this.login.username}`,
      async (payload) => await this.onMessage(payload)
    );

    this.stompClient.send(
      "/app/chat.register",
      {},
      JSON.stringify(
        new WebSocketMessageDto({
          type: WebSocketMessageTypes.join,
          join: { sender: this.login.username, status: null },
        })
      )
    );
  }

  async messageNotification(message) {
    if (!message.content || this.login.username === message.sender) {
      return;
    }

    let room =
      await this.conversationListRef.value?.findConversationByRoomNameOrFetchIt(
        message.roomName
      );

    if (Notification.permission === "granted") {
      let notification = new Notification(room.description, {
        body: message.content,
      });

      // notification.onclick = function () {
      //   this.conversationListRef.value.sidebarListRef.value.selectChat(

      //   );
      //   window.focus("/");
      // };
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(function (permission) {
        if (permission === "granted") {
          let notification = new Notification(roomName, {
            body: message.content,
          });

          notification.onclick = function () {
            this.conversationListRef.value.sidebarListRef.value.selectChat(
              message,
              this.activeConversation?.description
            );
            window.focus("/");
          };
        }
      });
    }
  }

  async onMessage(payload) {
    let message = new WebSocketMessageDto(JSON.parse(payload.body));
    if (message.type === WebSocketMessageTypes.chat) {
      // CHAT
      await this.manageChatMessageReceived(message);
    } else if (message.type === WebSocketMessageTypes.edit) {
      // EDIT
      await this.manageEditMessageReceived(message);
    } else if (message.type === WebSocketMessageTypes.delete) {
      // DELETE
      await this.manageDeleteMessageReceived(message);
    } else if (message.type === WebSocketMessageTypes.join) {
      // JOIN
      this.manageJoinMessageReceived(message);
    } else if (message.type === WebSocketMessageTypes.quit) {
      // QUIT
      this.manageQuitMessageReceived(message);
    }
  }

  async manageChatMessageReceived(message) {
    let chatMessage = new MessageDto(message.chat);

    if (chatMessage.content !== null) {
      if (this.activeChatName == chatMessage.roomName) {
        if (this.hasMorePrev === false) {
          this.messages = [...this.messages, chatMessage];
          await CommandsService.setMessagesAsRead([chatMessage.id]);
        } else {
          // This means there are some not loaded messages more recent that those displayed.
          let cookie = CookieService.getCookie();

          if (chatMessage.sender === cookie.username) {
            await this.scrollToBottomAndRefetch();
          }
        }
      }

      await this.updateLastMessageInConversationList(chatMessage);

      // set the message as unread:

      if (this.login.username !== chatMessage.sender) {
        // the counter won't be update if you are the sender
        this.conversationListRef.value?.incrementUnreadMessageCounter(
          chatMessage
        );
      }
    }

    this.conversationListRef.value?.clearSearchInput();
    await this.messageNotification(chatMessage);
  }

  async manageEditMessageReceived(message) {
    let editedMessage = new MessageDto(message.edit);

    if (this.activeChatName === editedMessage.roomName) {
      let index = this.messages.findIndex(
        (item) => item.id === editedMessage.id
      );

      if (index > -1) {
        this.messages[index] = new MessageDto({
          ...this.messages[index],
          content: editedMessage.content,
          status: MessageStatuses.edited,
        });

        if (index === this.messages.length - 1)
          await this.updateLastMessageInConversationList(this.messages[index]);
      } else {
        this.updateEditedOrDeletedLastMessageIfItIsLastMessageOfConversation(
          editedMessage
        );
      }
    } else {
      this.updateEditedOrDeletedLastMessageIfItIsLastMessageOfConversation(
        editedMessage
      );
    }

    this.messagesListRef.value?.requestUpdate();
  }

  async manageDeleteMessageReceived(message) {
    let deletedMessage = new MessageDto(message.delete);

    if (this.activeChatName === deletedMessage.roomName) {
      let index = this.messages.findIndex(
        (item) => item.id === deletedMessage.id
      );

      if (index > -1) {
        this.messages[index] = new MessageDto({
          ...this.messages[index],
          content: "",
          status: MessageStatuses.deleted,
        });

        if (index === this.messages.length - 1) {
          await this.updateLastMessageInConversationList(
            new MessageDto({
              ...this.messages[index],
              content: GenericConstants.deletedMessageContent,
            })
          );
        }

        this.messagesListRef.value?.requestUpdate();
      } else {
        this.updateEditedOrDeletedLastMessageIfItIsLastMessageOfConversation(
          new MessageDto({
            ...deletedMessage,
            content: GenericConstants.deletedMessageContent,
          })
        );
      }
    } else {
      this.updateEditedOrDeletedLastMessageIfItIsLastMessageOfConversation(
        new MessageDto({
          ...deletedMessage,
          content: GenericConstants.deletedMessageContent,
        })
      );
    }
  }

  async manageJoinMessageReceived(message) {
    const joinMessage = message.join;

    if (joinMessage.sender !== this.login.username) {
      UsersService.updateUserStatusInSessionStorage(
        joinMessage.sender,
        "ONLINE"
      );

      this.messagesListRef.value?.getAllNeededUsers();
      this.conversationListRef.value?.getAllNeededUsers();

      if (joinMessage.sender === this.headerRef.value?.getOtherUser().name) {
        let user = (await UsersService.getUsers([joinMessage.sender]))[0];
        this.headerRef.value?.setOtherUser(user);
      }
    }
  }

  async manageQuitMessageReceived(message) {
    const quitMessage = message.quit;

    if (quitMessage.sender !== this.login.username) {
      UsersService.updateUserStatusInSessionStorage(
        quitMessage.sender,
        "OFFLINE"
      );

      this.messagesListRef.value?.getAllNeededUsers();
      this.conversationListRef.value?.getAllNeededUsers();

      if (quitMessage.sender === this.headerRef.value?.getOtherUser().name) {
        let user = (await UsersService.getUsers([quitMessage.sender]))[0];
        this.headerRef.value?.setOtherUser(user);
      }
    }
  }

  buildMessageAndSend(messageContent, type) {
    if (messageContent && this.stompClient) {
      const chatMessage = new WebSocketMessageDto({
        type: type,
        chat: {
          sender: this.login.username,
          content: messageContent,
        },
      });

      let activeChatName = this.formatActiveChatName(this.activeChatName);

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

  formatActiveChatName(activeChatName) {
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
