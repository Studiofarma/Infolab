import { LitElement, html, css } from "lit";
import { when } from "lit/directives/when.js";

import { CookieService } from "../../../../services/cookie-service";
import { OpenChatsService } from "../../../../services/open-chats-service";
import { UsersService } from "../../../../services/users-service";

import "../../../../components/avatar";
import "./conversation";
import "../search-chats";
import "../../../../components/button-text";
import { ConversationDto } from "../../../../models/conversation-dto";

const arrowUp = "ArrowUp";
const arrowDown = "ArrowDown";
const enter = "Enter";

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
  }

  static styles = css`
    * {
      box-sizing: border-box;
      padding: 0;
      margin: 0;
    }

    #selected {
      background-color: #e1f0ff;
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
      background-color: #206cf7;
    }

    .conversation {
      margin-right: 3px;
      border-radius: 7px;
      transition: background-color 0.2s;
    }

    .conversation:hover {
      background-color: #e1f0ff;
    }

    .active {
      background-color: #c5e1fe;
    }

    .separator {
      padding: 5px 0px 5px 10px;
      color: #1d1e20;
    }

    .conversation-list-scrollable {
      overflow-y: scroll;
      height: 100%;
    }

    il-button-text {
      padding-left: 175px;
    }
  `;

  render() {
    return html`
      <div class="container">
        <il-search
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
            <p class="separator">
              ${this.newConversationList.length > 0
                ? "Nuove conversazioni"
                : ""}
            </p>
            <div class="conversation-list">
              ${this.renderNewConversationList()}
            </div>
          </div>
        </div>
        ${when(
          this.isForwardList,
          () => html`<il-button-text text="Inoltra"></il-button-text>`
        )}
      </div>
    `;
  }

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
    this.activeChatName = conversation.roomName;
    this.activeDescription = conversation.description;
    this.updateMessages(conversation);

    CookieService.setCookieByKey(
      CookieService.Keys.lastChat,
      conversation.roomName
    );

    CookieService.setCookieByKey(
      CookieService.Keys.lastDescription,
      conversation.description
    );

    this.dispatchEvent(
      new CustomEvent("change-conversation", {
        detail: {
          conversation: { ...conversation },
          eventType: event.type,
        },
      })
    );

    this.cleanSearchInput();
    this.update();
  }

  setQueryString(event) {
    this.query = event.detail.query;
    this.selectedRoom = "";
    this.indexOfSelectedChat = -1;
    this.update();
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
    this.update();
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
          this.conversationList.push(room);
        } else {
          let conversation = {
            roomName: room.roomName,
            avatarLink: room.avatarlink,
            unreadMessages: room.unreadMessages,
            description: room.description,
            lastMessage: room.lastMessage,
            id: this.usersList[userIndex].id,
          };
          this.conversationList.push(conversation);
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

    this.conversationList[index].lastMessage = {
      content: message.content,
      timestamp: message.timestamp,
      sender: message.sender,
    };

    this.conversationList.sort(this.compareTimestamp);

    this.update();
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
    };
  }

  compareTimestamp(a, b) {
    var timestampA = Date.parse(a.lastMessage.timestamp);
    var timestampB = Date.parse(b.lastMessage.timestamp);
    return timestampB - timestampA;
  }

  renderConversationList() {
    this.conversationListFiltered = this.filterConversations(
      this.conversationList
    );

    return this.conversationListFiltered.map((pharmacy) => {
      let conversation = new ConversationDto(pharmacy);
      if (
        conversation.lastMessage.content ||
        conversation.roomName == this.activeChatName
      ) {
        return html`<il-conversation
          isSelectable=${this.isForwardList}
          class=${"conversation " +
          (conversation.roomName == this.activeChatName ||
          conversation.roomName == this.selectedRoom.roomName
            ? "active"
            : "")}
          id=${conversation.roomName == this.selectedRoom.roomName
            ? "selected"
            : ""}
          .chat=${conversation}
          @clicked=${(event) => this.changeRoom(event, conversation)}
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

    return this.newConversationListFiltered.map((pharmacy) => {
      let conversation = new ConversationDto(pharmacy);
      return html`<il-conversation
        isSelectable=${this.isForwardList}
        class=${"conversation new-conversation " +
        (conversation.roomName == this.activeChatName ||
        conversation.roomName == this.selectedRoom.roomName
          ? "active"
          : "")}
        .chat=${conversation}
        id=${conversation.roomName == this.selectedRoom.roomName
          ? "selected"
          : ""}
        @clicked=${(event) => this.changeRoom(event, conversation)}
      ></il-conversation>`;
    });
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
    let searchInput = this.shadowRoot
      .querySelector("il-search")
      ?.shadowRoot.querySelector("il-input-ricerca");
    if (searchInput) searchInput.clear();
    this.query = searchInput.value;
    this.update();
  }

  chatNameRecomposer(user1, user2) {
    let array = [user1, user2].sort();

    return array.join("-");
  }
}

customElements.define("il-conversation-list", ConversationList);
