import { LitElement, html, css } from "lit";
import { ref, createRef } from "lit/directives/ref.js";
import { when } from "lit/directives/when.js";
import { repeat } from "lit/directives/repeat.js";

import { CookieService } from "../../../../services/cookie-service";
import { OpenChatsService } from "../../../../services/open-chats-service";
import { UsersService } from "../../../../services/users-service";
import {ThemeColorService } from "../../../../services/theme-color-service"

import "../../../../components/avatar";
import "./conversation";
import "../search-chats";
import "../../../../components/button-text";
import { ConversationDto } from "../../../../models/conversation-dto";


const arrowUp = "ArrowUp";
const arrowDown = "ArrowDown";
const enter = "Enter";

const noResult = html`<p class="no-result">Nessun risultato</p>`;

class ConversationList extends LitElement {
  static properties = {
    conversationList: { type: Array },
    newConversationList: { type: Array },
    users: { type: Array },
    activeChatName: { type: String },
    activeDescription: { type: String },
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
    this.activeChatName =
      CookieService.getCookieByKey(CookieService.Keys.lastChat) || "";
    this.activeDescription =
      CookieService.getCookieByKey(CookieService.Keys.lastDescription) || "";
    this.onLoad();
    this.indexOfSelectedChat = -1;
    this.selectedRoom = {};
    this.selectedChats = [];
    this.isOpen = false;

    // Refs
    this.inputRef = createRef();
  }

  static styles = css`
    * {
      box-sizing: border-box;
      padding: 0;
      margin: 0;
      ${ThemeColorService.applyStyle()};
    }

    #selected {
      background-color: var(--conversationHoverBg);
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
      background-color: var(--scrollbar);
    }

    .conversation {
      margin-right: 3px;
      border-radius: 7px;
      transition: background-color 0.2s;
    }

    .conversation:hover {
      background-color:  var(--conversationHoverBg);
    }

    .active {
      background-color:  var(--conversationActiveBg);
    }

    .separator {
      padding: 5px 0px 5px 10px;
      color: var(--sidebarSeparator);
    }

    .conversation-list-scrollable {
      overflow-y: scroll;
      height: 100%;
    }

    il-button-text {
      padding-left: 175px;
    }

    .no-result {
      color: var(--sidebarNoResults);
      text-align: center;
    }
  `;

  render() {
    return html`
      <div class="container">
        <il-search
          ${ref(this.inputRef)}
          @search-chat=${this.setQueryString}
          @keyPressed=${this.navigateSearchResultsWithArrows}
          @blur=${this.clearSelection}
        ></il-search>
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
              @click=${() =>
                this.dispatchEvent(
                  new CustomEvent("multiple-forward", {
                    detail: {
                      list: this.selectedChats,
                      conversation: this.lastSlectedConversation,
                    },
                  })
                )}
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

    return repeat(this.conversationListFiltered, (pharmacy) => {
      let conversation = new ConversationDto(pharmacy);

      if (
        conversation.lastMessage?.content ||
        conversation.roomName == this.activeChatName
      ) {
        let user = this.findUser(this.conversationListFiltered, conversation);

        return html`<il-conversation
          .userList=${this.usersList}
          .user=${user}
          @selected=${this.selectConversation}
          .isSelectable=${this.isForwardList && this.selectedChats.length != 0}
          .isSelected=${this.selectedChats.includes(conversation.roomName)}
          class=${"conversation " +
          (conversation.roomName == this.activeChatName ||
          conversation.roomName == this.selectedRoom.roomName
            ? "active"
            : "")}
          id=${conversation.roomName == this.selectedRoom.roomName
            ? "selected"
            : ""}
          .chat=${conversation}
          @clicked=${(event) => this.handleClick(event, conversation)}
        ></il-conversation>`;
      } else {
        let conversationIndex = this.conversationList.findIndex(
          (obj) => obj.roomName == conversation.roomName
        );
        let delChat = this.conversationList.splice(conversationIndex, 1)[0];
        this.newConversationList.unshift(delChat);
        return null;
      }
    });
  }

  renderNewConversationList() {
    this.newConversationListFiltered = this.filterConversations(
      this.newConversationList
    );

    if (this.newConversationListFiltered.length === 0) return noResult;

    return this.newConversationListFiltered.map((pharmacy) => {
      let conversation = new ConversationDto(pharmacy);

      let user = this.findUser(this.newConversationListFiltered, conversation);

      return html`<il-conversation
        .userList=${this.usersList}
        .user=${user}
        @selected=${this.selectConversation}
        .isSelectable=${this.isForwardList && this.selectedChats.length != 0}
        .isSelected=${this.selectedChats.includes(conversation.roomName)}
        class=${"conversation new-conversation " +
        (conversation.roomName == this.activeChatName ||
        conversation.roomName == this.selectedRoom.roomName
          ? "active"
          : "")}
        .chat=${conversation}
        id=${conversation.roomName == this.selectedRoom.roomName
          ? "selected"
          : ""}
        @clicked=${(event) => this.handleClick(event, conversation)}
      ></il-conversation>`;
    });
  }

  // Getters & Setters

  getActiveChatName() {
    return this.activeChatName;
  }

  setActiveChatName(value) {
    this.activeChatName = value;
  }

  getActiveDescription() {
    return this.activeDescription;
  }

  setActiveDescription(value) {
    this.activeDescription = value;
  }

  getConversationList() {
    return [...this.conversationList];
  }

  getNewConversationList() {
    return [...this.newConversationList];
  }

  // -----------------------------

  navigateSearchResultsWithArrows(e) {
    if (e.detail.key == arrowDown || e.detail.key == arrowUp)
      this.changeIndexOfSelectedChat(e.detail.key);

    if (this.indexOfSelectedChat <= -1) {
      this.clearSelection();
      return;
    }

    this.scrollToSelectedChat();
    this.getSelectedRoom();

    if (e.detail.key == enter) this.changeRoom(e, this.selectedRoom);
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
    this.activeChatName = conversation.roomName;
    this.activeDescription = conversation.description;
    this.updateMessages(conversation);

    this.dispatchEvent(
      new CustomEvent("change-conversation", {
        detail: {
          conversation: { ...conversation },
          eventType: event.type,
        },
      })
    );

    this.cleanSearchInput();
    this.requestUpdate();
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

  async onLoad() {
    await this.getAllUsers();
    await this.getAllRooms();
    this.setNewConversationList();
    this.requestUpdate();
  }

  async getAllRooms() {
    let cookie = CookieService.getCookie();

    try {
      let rooms = await OpenChatsService.getOpenChats(
        cookie.username,
        cookie.password
      );
      rooms["data"].forEach((room) => {
        let userIndex = this.usersList.findIndex(
          (user) => user.description == room.description
        );
        if (userIndex == -1) {
          this.conversationList = [...this.conversationList, room];
        } else {
          let conversation = {
            roomName: room.roomName,
            avatarLink: room.avatarlink,
            unreadMessages: room.unreadMessages,
            description: room.description,
            lastMessage: room.lastMessage || "",
            id: this.usersList[userIndex].id,
          };
          this.conversationList = [...this.conversationList, conversation];
        }
      });

      this.conversationList.sort(this.compareTimestamp);
    } catch (error) {
      console.error(error);
    }
  }

  async getAllUsers() {
    let cookie = CookieService.getCookie();
    try {
      let users = await UsersService.GetUsers(
        this.query,
        cookie.username,
        cookie.password
      );
      this.usersList = users["data"];
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

  setList(message) {
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
    return {
      roomName: roomName,
      avatarLink: null,
      unreadMessages: 0,
      lastMessage: {
        preview: null,
        sender: null,
        timestamp: null,
      },
      description: user.description === "" ? user.name : user.description,
      id: user.id,
      status: user.status,
    };
  }

  compareTimestamp(a, b) {
    var timestampA = Date.parse(a.lastMessage?.timestamp);
    var timestampB = Date.parse(b.lastMessage?.timestamp);
    return timestampB - timestampA;
  }

  findUser(list, conversation) {
    // TODO: semplificare quando arriverà dal backend (questo fa un giro assurdo perché nelle room non ci sono gli utenti che le compongono)
    let cookie = CookieService.getCookie();

    let convIndex = list.findIndex((elem) => {
      return elem.roomName === conversation.roomName;
    });

    let roomName = list[convIndex].roomName;

    let usernames = roomName.split("-");
    let username = usernames.filter((elem) => elem !== cookie.username)[0];

    let userIndex = this.usersList.findIndex((elem) => elem.name === username);

    return this.usersList[userIndex];
  }

  handleClick(e, conversation) {
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

  updateMessages(conversation) {
    this.dispatchEvent(
      new CustomEvent("update-message", {
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
}

customElements.define("il-conversation-list", ConversationList);
