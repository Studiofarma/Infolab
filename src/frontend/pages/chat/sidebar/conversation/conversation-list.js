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
import "../../../../components/infinite-scroll";

import { ConversationDto } from "../../../../models/conversation-dto";
import { BaseComponent } from "../../../../components/base-component";

const debounce = require("lodash.debounce");

const arrowUp = "ArrowUp";
const arrowDown = "ArrowDown";
const enter = "Enter";

const noResult = html`<p data-cy="no-result" class="no-result">
  Nessun risultato
</p>`;

const selectedRoomKey = "selected-room"; // This is for the room the user is inside
const selectedChatsKey = "selected-chats"; // This for the rooms the user has selected in the forward list

class ConversationList extends BaseComponent {
  static properties = {
    conversationList: { type: Array },
    newConversationList: { type: Array },
    usersList: { type: Array },
    conversationListFiltered: { type: Array },
    newConversationListFiltered: { type: Array },
    indexOfSelectedChat: { type: Number },
    selectedRoom: { type: Object }, // This is the room the user is inside
    activeChatName: { type: String },
    isForwardList: false,
    selectedChats: {}, // This is an array of rooms the user has selected in the forward list
    isOpen: false,
    lastSlectedConversation: {},
    hasMore: { type: Boolean },

    conversationOpenBeforeQuit: { type: Object },
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
    this.hasMore = true;
    this.shouldRefetch = true;

    this.debouncedFetch = debounce(async () => {
      this.conversationList = [];
      this.newConversationList = [];
      this.hasMore = true;
      await this.getNextRoomsFiltered();
      this.requestUpdate();
    }, 750);

    this.cookie = CookieService.getCookie();
    this.onLoad();

    // Refs
    this.inputRef = createRef();
    this.infiniteScrollRef = createRef();
  }

  async onLoad() {
    await this.getNextRoomsFiltered();
    await this.updateLastOpenConversation();
    this.requestUpdate();
  }

  async updated(changedProperties) {
    if (
      changedProperties.has("conversationList") ||
      changedProperties.has("newConversationList")
    ) {
      await this.getAllNeededUsers();
    }
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
        <il-infinite-scroll
          ${ref(this.infiniteScrollRef)}
          class="conversation-list-scrollable"
          @il:updated-next=${() => {
            this.getNextRoomsFiltered();
          }}
          .hasMoreNext=${this.hasMore}
          .threshold=${500}
        >
          <div>
            <p data-cy="separator" class="separator">Conversazioni</p>
            <div class="conversation-list">
              ${this.renderConversationList()}
            </div>
          </div>
          <div>
            <p data-cy="separator" class="separator">Nuove conversazioni</p>
            <div class="conversation-list">
              ${this.renderNewConversationList()}
            </div>
          </div>
        </il-infinite-scroll>
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
    if (this.conversationList.length === 0) return noResult;

    let conversation = this.conversationOpenBeforeQuit;

    if (this.isStartup && !this.isForwardList && conversation) {
      this.changeRoom(new CustomEvent("il:first-updated"), conversation);
      this.isStartup = false;
    }

    return repeat(
      this.conversationList,
      (pharmacy) => pharmacy.roomName,
      (pharmacy) => {
        let conversation = new ConversationDto(pharmacy);

        let conversationUser = this.getOtherUserInRoom(conversation);

        let lastMessageUser = conversation.lastMessage.sender;

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
    if (this.newConversationList.length === 0) return noResult;

    let conversation = this.conversationOpenBeforeQuit;

    if (this.isStartup && !this.isForwardList && conversation) {
      this.changeRoom(new CustomEvent("il:first-updated"), conversation);
      this.isStartup = false;
    }

    return repeat(
      this.newConversationList,
      (pharmacy) => pharmacy.roomName,
      (pharmacy) => {
        let conversation = new ConversationDto(pharmacy);

        let conversationUser = this.getOtherUserInRoom(conversation);

        let lastMessageUser = conversation.lastMessage.sender;

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

  getConversationList() {
    return [...this.conversationList];
  }

  getNewConversationList() {
    return [...this.newConversationList];
  }

  //#endregion -----------------------------

  async updateLastOpenConversation() {
    let conversation = JSON.parse(localStorage.getItem(selectedRoomKey));

    if (this.isStartup && !this.isForwardList && conversation) {
      try {
        let downloadData = await ConversationService.getDownloadInfoByRoomName(
          conversation.roomName
        );

        this.conversationOpenBeforeQuit = {
          ...conversation,
          lastReadTimestamp: downloadData.lastReadTimestamp,
          unreadMessages: downloadData.unreadMessages,
        };
      } catch (e) {
        console.error(e);
        this.conversationOpenBeforeQuit = conversation;
      }
    }
  }

  async updateConversation(conversation) {
    if (
      !this.isStartup &&
      !this.isForwardList &&
      conversation &&
      conversation.unreadMessages > 0
    ) {
      try {
        let downloadData = await ConversationService.getDownloadInfoByRoomName(
          conversation.roomName
        );
        return {
          ...conversation,
          lastReadTimestamp: downloadData.lastReadTimestamp,
          unreadMessages: downloadData.unreadMessages,
        };
      } catch (e) {
        console.error(e);
        return conversation;
      }
    } else {
      return conversation;
    }
  }

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

    this.shouldRefetch = true;

    this.selectedChats = [];
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
    let convListLength = this.conversationList.length;
    let newConvListLength = this.newConversationList.length;
    let maxIndex = convListLength + newConvListLength - 1;

    if (key == arrowDown && this.indexOfSelectedChat < maxIndex)
      this.indexOfSelectedChat++;

    if (key == arrowUp && this.indexOfSelectedChat > -1)
      this.indexOfSelectedChat--;
  }

  getSelectedRoom() {
    let convListLength = this.conversationList.length;
    let selected =
      this.indexOfSelectedChat < convListLength
        ? this.conversationList[this.indexOfSelectedChat]
        : this.newConversationList[this.indexOfSelectedChat - convListLength];
    this.selectedRoom = { ...selected };
  }

  async changeRoom(event, conversation) {
    this.dispatchEvent(new CustomEvent("il:conversation-is-going-to-change"));

    CookieService.setCookieByKey(
      CookieService.Keys.lastChat,
      conversation.roomName
    );

    this.cookie.lastChat = conversation.roomName;

    localStorage.setItem(selectedRoomKey, JSON.stringify(conversation));

    // unset the unread messages counter
    this.unsetUnreadMessages(conversation.roomName);

    localStorage.setItem(
      selectedRoomKey,
      JSON.stringify(this.findConversationByRoomName(conversation.roomName))
    );

    let updatedConv = await this.updateConversation(conversation);

    this.dispatchEvent(
      new CustomEvent("il:conversation-changed", {
        detail: {
          conversation: conversation,
          user: await this.getOtherUserInRoomOrFetch(conversation),
          eventType: event.type,
        },
      })
    );

    this.fetchMessages(updatedConv);
    this.clearSearchInput();
    this.requestUpdate();
  }

  setQueryString(event) {
    this.query = event.detail.query;
    this.selectedRoom = "";
    this.indexOfSelectedChat = -1;
    this.shouldRefetch = true;
    this.debouncedFetch();
  }

  async getNextRoomsFiltered() {
    if (this.hasMore) {
      try {
        let componentName = this.isForwardList
          ? ConversationService.forwardListSearch
          : ConversationService.conversationListSearch;

        let rooms = await ConversationService.getNextConversationsFiltered(
          componentName,
          this.query,
          this.shouldRefetch
        );

        if (this.shouldRefetch) {
          this.shouldRefetch = false;
        }

        if (rooms.length < ConversationService.pageSize) {
          this.hasMore = false;
        }

        rooms.forEach((room) => {
          if (room.roomOrUser === "ROOM") {
            this.conversationList = [...this.conversationList, room];
          } else if (room.roomOrUser === "USER_AS_ROOM") {
            this.newConversationList = [...this.newConversationList, room];
          }
        });

        this.conversationList.sort(this.compareTimestamp);
      } catch (error) {
        console.error(error);
      }
    }
  }

  async getNextRooms() {
    if (this.hasMore) {
      try {
        let componentName = this.isForwardList
          ? ConversationService.forwardList
          : ConversationService.conversationList;

        let rooms = await ConversationService.getNextConversations(
          componentName
        );

        if (rooms.length < ConversationService.pageSize) {
          this.hasMore = false;
        }

        rooms.forEach((room) => {
          if (room.roomOrUser === "ROOM") {
            this.conversationList = [...this.conversationList, room];
          } else if (room.roomOrUser === "USER_AS_ROOM") {
            this.newConversationList = [...this.newConversationList, room];
          }
        });

        this.conversationList.sort(this.compareTimestamp);
      } catch (error) {
        console.error(error);
      }
    }
  }

  async getAllUsers(usernames) {
    try {
      this.usersList = await UsersService.getUsers(usernames);
    } catch (error) {
      console.error(error);
    }
  }

  async getAllNeededUsers() {
    let usernames = new Set();

    this.conversationList.forEach((conversation) => {
      if (conversation.roomType === "USER2USER") {
        usernames.add(conversation.otherParticipants[0].name);
      }
    });

    this.newConversationList.forEach((conversation) => {
      if (conversation.roomType === "USER2USER") {
        usernames.add(conversation.otherParticipants[0].name);
      }
    });

    usernames.add(this.cookie.username);

    if (usernames.size > 0) await this.getAllUsers(Array.from(usernames));
  }

  setNewConversationList() {
    let cookie = CookieService.getCookie();
    this.usersList.forEach((user) => {
      if (user.name != cookie.username) {
        this.setUsersList(user);
      }
    });
  }

  async updateLastMessage(message) {
    let conversation = await this.findConversationByRoomNameOrFetchIt(
      message.roomName
    );

    let lastMessageUser = (await UsersService.getUsers([message.sender]))[0];

    conversation.lastMessage = {
      id: message.id,
      content: message.content,
      timestamp: message.timestamp,
      sender: {
        name: lastMessageUser.name,
        id: lastMessageUser.id,
        description: lastMessageUser.description,
      },
    };

    if (!this.isInConversationList(message.roomName)) {
      let index = this.newConversationList.findIndex(
        (element) => element.roomName === message.roomName
      );
      this.newConversationList.splice(index, 1);

      this.conversationList = [...this.conversationList, conversation];
    }

    this.conversationList.sort(this.compareTimestamp);

    this.requestUpdate();
  }

  async updateLastMessageIfItIsLastMessageOfConversation(message) {
    let conversation = await this.findConversationByRoomNameOrFetchIt(
      message.roomName
    );

    let lastMessageUser = (await UsersService.getUsers([message.sender]))[0];

    if (conversation.lastMessage.id === message.id) {
      conversation.lastMessage = {
        id: message.id,
        content: message.content,
        timestamp: message.timestamp,
        sender: {
          name: lastMessageUser.name,
          id: lastMessageUser.id,
          description: lastMessageUser.description,
        },
      };

      this.conversationList.sort(this.compareTimestamp);

      this.requestUpdate();
    }
  }

  incrementUnreadMessageCounter(message) {
    let conversation = this.findConversationByRoomName(message.roomName);

    conversation.unreadMessages += 1;

    if (this.activeChatName === message.roomName) {
      // If I have open the chat of the user who has just sended me a message, this laster will be automatically set as read.
      setTimeout(() => this.unsetUnreadMessages(message.roomName), 1000);
    }

    this.requestUpdate();
  }

  unsetUnreadMessages(conversationRoomName) {
    let conversation = this.findConversationByRoomName(conversationRoomName);

    conversation.unreadMessages = 0;

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

  /**
   * It is a reverse comparator.
   */
  compareTimestamp(a, b) {
    var timestampA;
    var timestampB;

    if (a.lastMessage.timestamp !== null) {
      if (b.lastMessage.timestamp !== null) {
        timestampA = Date.parse(a.lastMessage?.timestamp);
        timestampB = Date.parse(b.lastMessage?.timestamp);
      } else {
        return -1;
      }
    } else {
      if (b.lastMessage.timestamp !== null) {
        return +1;
      } else {
        return -a.description.localeCompare(b.description);
      }
    }

    return timestampB - timestampA;
  }

  getOtherUserInRoom(conversation) {
    if (!conversation.otherParticipants[0]) {
      return;
    }

    let username = conversation.otherParticipants[0].name;

    return this.getUserByUsername(username);
  }

  getOtherUserInRoomOrFetch(conversation) {
    if (!conversation.otherParticipants[0]) {
      return;
    }

    let username = conversation.otherParticipants[0].name;

    return this.getUserByUsernameOrFetch(username);
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

  clearSearchInput() {
    if (this.query !== "") {
      this.inputRef.value?.clear();
      this.query = "";
      this.debouncedFetch();
    }
  }

  chatNameRecomposer(user1, user2) {
    let array = [user1, user2].sort();

    return array.join("-");
  }

  findConversationByUsername(username) {
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

  async findConversationByRoomNameOrFetchIt(roomName) {
    let conversation = this.findInOpenConversationList(roomName);

    if (!conversation) {
      conversation = this.findInNewConversationList(roomName);
    }

    if (!conversation) {
      conversation = await ConversationService.getConversationByRoomName(
        roomName
      );
    }

    if (!conversation) {
      conversation = JSON.parse(localStorage.getItem(selectedRoomKey));
    }

    return conversation;
  }

  findConversationByRoomName(roomName) {
    let conversation = this.findInOpenConversationList(roomName);

    if (!conversation) {
      conversation = this.findInNewConversationList(roomName);
    }

    if (!conversation) {
      conversation = JSON.parse(localStorage.getItem(selectedRoomKey));
    }

    return conversation;
  }

  findInOpenConversationList(roomName) {
    return this.conversationList.find(
      (conversation) => conversation.roomName === roomName
    );
  }

  findInNewConversationList(roomName) {
    return this.newConversationList.find(
      (conversation) => conversation.roomName === roomName
    );
  }

  isInConversationList(roomName) {
    return this.conversationList.some(
      (conversation) => conversation.roomName === roomName
    );
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

  async getUserByUsernameOrFetch(username) {
    if (username === undefined)
      return { username: undefined, description: undefined };
    if (this.usersList === undefined)
      return { username: undefined, description: undefined };

    let userIndex = this.usersList.findIndex((user) => user.name == username);

    if (userIndex < 0)
      return (await UsersService.getUsersByUsernames([username]))[0];

    return this.usersList[userIndex];
  }
}

customElements.define("il-conversation-list", ConversationList);
