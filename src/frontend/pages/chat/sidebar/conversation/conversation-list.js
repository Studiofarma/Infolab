import { html, css } from "lit";
import { ref, createRef } from "lit/directives/ref.js";
import { when } from "lit/directives/when.js";
import { repeat } from "lit/directives/repeat.js";

import { CookieService } from "../../../../services/cookie-service";
import { ConversationService } from "../../../../services/conversations-service";
import { UsersService } from "../../../../services/users-service";
import { ThemeColorService } from "../../../../services/theme-color-service";

import { ThemeCSSVariables } from "../../../../enums/theme-css-variables";

import "../../../../components/avatar";
import "./conversation";
import "../../../../components/input-search";
import "../../../../components/button-text";
import { ConversationDto } from "../../../../models/conversation-dto";
import { BaseComponent } from "../../../../components/base-component";

const arrowUp = "ArrowUp";
const arrowDown = "ArrowDown";
const enter = "Enter";

const noResult = html`<p class="no-result">Nessun risultato</p>`;

class ConversationList extends BaseComponent {
  static properties = {
    conversationList: { type: Array },
    newConversationList: { type: Array },
    usersList: { type: Array },
    conversationListFiltered: { type: Array },
    newConversationListFiltered: { type: Array },
    indexOfSelectedChat: { type: Number },
    selectedRoom: { type: Object },
    isForwardList: false,
    selectedChats: {},
    isOpen: false,
    lastSlectedConversation: {},
  };

  constructor() {
    super();
    this.query = "";
    this.conversationList = [];
    this.newConversationList = [];
    this.usersList = [];
    this.indexOfSelectedChat = -1;
    this.selectedRoom = {};
    this.selectedChats = [];
    this.isOpen = false;
    this.isStartup = true;

    this.cookie = CookieService.getCookie();
    this.onLoad();

    // Refs
    this.inputRef = createRef();
  }

  async onLoad() {
    await this.getAllUsers();
    await this.getAllRooms();
    this.setNewConversationList();
    this.requestUpdate();
  }

  static styles = css`
    * {
      box-sizing: border-box;
      padding: 0;
      margin: 0;
      ${ThemeColorService.getThemeVariables()};
    }

    #selected {
      background-color: ${ThemeCSSVariables.conversationHoverBg};
    }

    .conversation-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-right: 3px;
    }

    .container {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    ::-webkit-scrollbar {
      width: 4px;
      margin-right: 10px;
    }

    ::-webkit-scrollbar-track {
      background-color: none;
    }

    ::-webkit-scrollbar-thumb {
      border-radius: 10px;
      background-color: ${ThemeCSSVariables.scrollbar};
    }

    .conversation {
      margin-right: 3px;
      border-radius: 7px;
      transition: background-color 0.2s;
    }

    .conversation:hover {
      background-color: ${ThemeCSSVariables.conversationHoverBg};
    }

    .active {
      background-color: ${ThemeCSSVariables.conversationActiveBg};
    }

    .separator {
      padding: 5px 0px 5px 10px;
      color: ${ThemeCSSVariables.sidebarSeparator};
    }

    .conversation-list-scrollable {
      overflow-y: scroll;
      height: 100%;
    }

    il-button-text {
      padding-left: 175px;
    }

    .no-result {
      color: ${ThemeCSSVariables.sidebarNoResults};
      text-align: center;
    }

    il-input-search {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    .search-chats {
      width: 100%;
      padding: 15px 10px 10px;
      column-gap: 10px;
      position: relative;
    }
  `;

  render() {
    return html`
      <div class="container">
        <div class="search-chats">
          <il-input-search
            ${ref(this.inputRef)}
            @il:searched=${this.setQueryString}
            @keydown=${this.navigateSearchResultsWithArrows}
            @blur=${this.clearSelection}
          ></il-input-search>
        </div>
        <div class="conversation-list-scrollable">
          <div>
            <p class="separator">Conversazioni</p>
            <div class="conversation-list">
              ${this.renderConversationList()}
            </div>
          </div>
          <div>
            <p class="separator">Nuove conversazioni</p>
            <div class="conversation-list">
              ${this.renderNewConversationList()}
            </div>
          </div>
        </div>
        ${when(
          this.isForwardList && this.selectedChats.length != 0,
          () =>
            html`<il-button-text
              text="Inoltra"
              @click=${this.handleForward}
            ></il-button-text>`
        )}
      </div>
    `;
  }

  renderConversationList() {
    this.conversationListFiltered = this.filterConversations(
      this.conversationList
    );

    if (this.conversationListFiltered.length === 0) return noResult;

    return repeat(
      this.conversationListFiltered,
      (pharmacy) => pharmacy.roomName,
      (pharmacy) => {
        let conversation = new ConversationDto(pharmacy);
        if (
          conversation.roomName === this.cookie.lastChat &&
          this.isStartup &&
          !this.isForwardList
        ) {
          this.changeRoom(new CustomEvent("il:first-updated"), conversation);
          this.isStartup = false;
        }

        let conversationUser = this.findUser(
          this.conversationListFiltered,
          conversation
        );

        let lastMessageUser = this.getUserByUsername(
          conversation.lastMessage.sender
        );

        return html`<il-conversation
          .conversationUser=${conversationUser}
          .lastMessageUser=${lastMessageUser}
          .isSelectable=${this.isForwardList && this.selectedChats.length != 0}
          .isSelected=${this.selectedChats.includes(conversation.roomName)}
          class=${"conversation " +
          (conversation.roomName == this.cookie.lastChat ||
          conversation.roomName == this.selectedRoom.roomName
            ? "active"
            : "")}
          id=${conversation.roomName == this.selectedRoom.roomName
            ? "selected"
            : ""}
          .conversation=${conversation}
          @il:clicked=${(event) =>
            this.handleConversationClick(event, conversation)}
        ></il-conversation>`;
      }
    );
  }

  renderNewConversationList() {
    this.newConversationListFiltered = this.filterConversations(
      this.newConversationList
    );

    if (this.newConversationListFiltered.length === 0) return noResult;

    return repeat(
      this.newConversationListFiltered,
      (pharmacy) => pharmacy.roomName,
      (pharmacy) => {
        let conversation = new ConversationDto(pharmacy);

        if (
          conversation.roomName === this.cookie.lastChat &&
          this.isStartup &&
          !this.isForwardList
        ) {
          this.changeRoom(new CustomEvent("il:first-updated"), conversation);
          this.isStartup = false;
        }

        let conversationUser = this.findUser(
          this.newConversationListFiltered,
          conversation
        );

        let lastMessageUser = this.getUserByUsername(
          conversation.lastMessage.sender
        );

        return html`<il-conversation
          .conversationUser=${conversationUser}
          .lastMessageUser=${lastMessageUser}
          .isSelectable=${this.isForwardList && this.selectedChats.length != 0}
          .isSelected=${this.selectedChats.includes(conversation.roomName)}
          class=${"conversation new-conversation " +
          (conversation.roomName == this.cookie.lastChat ||
          conversation.roomName == this.selectedRoom.roomName
            ? "active"
            : "")}
          .conversation=${conversation}
          id=${conversation.roomName == this.selectedRoom.roomName
            ? "selected"
            : ""}
          @il:clicked=${(event) =>
            this.handleConversationClick(event, conversation)}
        ></il-conversation>`;
      }
    );
  }

  //#region Getters & Setters

  getActiveChatName() {
    return this.activeChatName;
  }

  setActiveChatName(value) {
    this.activeChatName = value;
    this.cookie.lastChat = value;
  }

  getActiveDescription() {
    return this.activeDescription;
  }

  setActiveDescription(value) {
    this.activeDescription = value;
    this.cookie.lastDescription = value;
  }

  getConversationList() {
    return [...this.conversationList];
  }

  getNewConversationList() {
    return [...this.newConversationList];
  }

  //#endregion -----------------------------

  handleForward() {
    if (this.selectedChats.length === 1) {
      this.changeRoom(
        new CustomEvent("il:forwarded"),
        this.lastSlectedConversation
      );
    } else {
      this.dispatchEvent(
        new CustomEvent("il:multiple-forwarded", {
          detail: {
            list: this.selectedChats,
            conversation: this.lastSlectedConversation,
          },
        })
      );
    }
  }

  navigateSearchResultsWithArrows(e) {
    if (e.key == arrowDown || e.key == arrowUp)
      this.changeIndexOfSelectedChat(e.key);

    if (this.indexOfSelectedChat <= -1) {
      this.clearSelection();
      return;
    }

    this.scrollToSelectedChat();
    this.getSelectedRoom();

    if (e.key == enter) this.changeRoom(e, this.selectedRoom);
  }

  clearSelection() {
    this.selectedRoom = {};
    this.indexOfSelectedChat = -1;
  }

  scrollToSelectedChat() {
    this.renderRoot
      .querySelectorAll("il-conversation")
      [this.indexOfSelectedChat].scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
  }

  changeIndexOfSelectedChat(key) {
    let convListLength = this.conversationListFiltered.length;
    let newConvListLength = this.newConversationListFiltered.length;
    let maxIndex = convListLength + newConvListLength - 1;

    if (key == arrowDown && this.indexOfSelectedChat < maxIndex)
      this.indexOfSelectedChat++;

    if (key == arrowUp && this.indexOfSelectedChat > -1)
      this.indexOfSelectedChat--;
  }

  getSelectedRoom() {
    let convListLength = this.conversationListFiltered.length;
    let selected =
      this.indexOfSelectedChat < convListLength
        ? this.conversationListFiltered[this.indexOfSelectedChat]
        : this.newConversationListFiltered[
            this.indexOfSelectedChat - convListLength
          ];
    this.selectedRoom = { ...selected };
  }

  changeRoom(event, conversation) {
    CookieService.setCookieByKey(
      CookieService.Keys.lastChat,
      conversation.roomName
    );

    CookieService.setCookieByKey(
      CookieService.Keys.lastDescription,
      conversation.description
    );
    this.cookie.lastChat = conversation.roomName;
    this.cookie.lastDescription = conversation.description;

    this.dispatchEvent(
      new CustomEvent("il:conversation-changed", {
        detail: {
          conversation: conversation,
          user: this.getOtherUserInRoom(conversation),
          eventType: event.type,
        },
      })
    );

    this.fetchMessages(conversation);
    this.cleanSearchInput();
    this.requestUpdate();
  }

  getOtherUserInRoom(conversation) {
    let username = this.extractUsername(conversation.roomName);

    let userIndex = this.usersList.findIndex((user) => user.name == username);
    if (userIndex < 0) return undefined;

    return this.usersList[userIndex];
  }

  setQueryString(event) {
    this.query = event.detail.query;
    this.selectedRoom = "";
    this.indexOfSelectedChat = -1;
    this.requestUpdate();
  }

  filterConversations(list) {
    return list.filter((conversation) =>
      conversation.description?.toLowerCase().includes(this.query.toLowerCase())
    );
  }

  async getAllRooms() {
    let cookie = CookieService.getCookie();

    try {
      let rooms = await ConversationService.getOpenConversations();
      rooms.forEach((room) => {
        let userIndex = this.usersList.findIndex(
          (user) => user.description == room.description
        );
        if (userIndex == -1) {
          this.conversationList = [...this.conversationList, room];
        } else {
          let conversation = new ConversationDto({
            roomName: room.roomName,
            avatarLink: room.avatarlink,
            unreadMessages: room.unreadMessages,
            description: room.description,
            lastMessage: room.lastMessage || "",
          });
          this.conversationList = [...this.conversationList, conversation];
        }
      });

      this.conversationList.sort(this.compareTimestamp);
    } catch (error) {
      console.error(error);
    }
  }

  async getAllUsers() {
    try {
      this.usersList = await UsersService.getUsers(this.query);
    } catch (error) {
      console.error(error);
    }
  }

  setNewConversationList() {
    let cookie = CookieService.getCookie();
    this.usersList.forEach((user) => {
      if (user.name != cookie.username) {
        this.setUsersList(user);
      }
    });
  }

  updateLastMessage(message) {
    let index = this.conversationList.findIndex(
      (conversation) => conversation.roomName == message.roomName
    );

    if (index === -1) {
      index = this.newConversationList.findIndex(
        (conversation) => conversation.roomName == message.roomName
      );

      this.newConversationList[index].lastMessage = {
        content: message.content,
        timestamp: message.timestamp,
        sender: message.sender,
      };

      this.newConversationList.sort(this.compareTimestamp);
    } else {
      this.conversationList[index].lastMessage = {
        content: message.content,
        timestamp: message.timestamp,
        sender: message.sender,
      };

      this.conversationList.sort(this.compareTimestamp);
    }

    this.requestUpdate();
  }

  setUsersList(user) {
    let cookie = CookieService.getCookie();

    let roomName = this.chatNameRecomposer(cookie.username, user.name);

    let isPresent = this.conversationList.some(
      (obj) => obj.roomName === roomName
    );

    if (!isPresent) {
      const roomFormatted = this.convertUserToRoom(roomName, user);
      this.newConversationList.push(roomFormatted);
    }
  }

  convertUserToRoom(roomName, user) {
    return new ConversationDto({
      roomName: roomName,
      avatarLink: null,
      unreadMessages: 0,
      description: user.description === "" ? user.name : user.description,
      lastMessage: {
        preview: null,
        sender: null,
        timestamp: null,
      },
    });
  }

  compareTimestamp(a, b) {
    var timestampA = Date.parse(a.lastMessage?.timestamp);
    var timestampB = Date.parse(b.lastMessage?.timestamp);
    return timestampB - timestampA;
  }

  findUser(list, conversation) {
    // TODO: semplificare quando arriverà dal backend (questo fa un giro assurdo perché nelle room non ci sono gli utenti che le compongono)
    let convIndex = list.findIndex((elem) => {
      return elem.roomName === conversation.roomName;
    });

    let roomName = list[convIndex].roomName;

    let username = this.extractUsername(roomName);

    let userIndex = this.usersList.findIndex((elem) => elem.name === username);

    return this.usersList[userIndex];
  }

  extractUsername(roomName) {
    let cookie = CookieService.getCookie();
    let usernames = roomName.split("-");
    return usernames.filter((elem) => elem !== cookie.username)[0];
  }

  handleConversationClick(e, conversation) {
    if (!this.isForwardList) this.changeRoom(e, conversation);

    this.lastSlectedConversation = conversation;
    this.selectConversation(e);
  }

  selectConversation(event) {
    if (event.detail?.add) {
      this.selectedChats.push(event.detail.room);
      this.requestUpdate();
    } else
      this.selectedChats = this.selectedChats.filter(
        (chat) => chat != event.detail.room
      );
  }

  fetchMessages(conversation) {
    this.dispatchEvent(
      new CustomEvent("il:messages-fetched", {
        detail: {
          conversation: conversation,
        },
      })
    );
  }

  cleanSearchInput() {
    this.inputRef.value?.clear();
    this.query = "";
    this.requestUpdate();
  }

  chatNameRecomposer(user1, user2) {
    let array = [user1, user2].sort();

    return array.join("-");
  }

  findConversation(username) {
    let index = this.conversationList.findIndex((conv) =>
      this.isUsernameInRoomName(conv.roomName, username)
    );
    if (index === -1) {
      index = this.newConversationList.findIndex((conv) =>
        this.isUsernameInRoomName(conv.roomName, username)
      );

      if (index === -1) return;

      return this.newConversationList[index];
    }

    return this.conversationList[index];
  }

  // TODO: rimuovere quando gli utenti in una stanza arriveranno dal backend
  isUsernameInRoomName(roomName, username) {
    let names = roomName.split("-");
    return names.includes(username);
  }

  getUserByUsername(username) {
    if (username === undefined)
      return { username: undefined, description: undefined };
    if (this.usersList === undefined)
      return { username: undefined, description: undefined };

    let userIndex = this.usersList.findIndex((user) => user.name == username);

    if (userIndex < 0) return { username: undefined, description: undefined };

    return this.usersList[userIndex];
  }
}

customElements.define("il-conversation-list", ConversationList);
