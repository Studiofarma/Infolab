import { LitElement, html, css } from "lit";

import { CookieService } from "../../../../services/cookie-service";
import { OpenChatsService } from "../../../../services/open-chats-service";
import { UsersService } from "../../../../services/users-service";

import "../../../../components/avatar";
import "./conversation";
import "../search-chats";
import { ConversationDto } from "../../../../models/conversation-dto";

class ConversationList extends LitElement {
  static properties = {
    conversationList: { state: true },
    activeChatName: { state: "general" },
    newConversationList: [],
    users: [],
    conversationListFiltered: [],
    newConversationListFiltered: [],
    indexOnConversationList: 0,
    selectedRoom: "",
  };

  constructor() {
    super();

    this.query = "";
    this.conversationList = [];
    this.newConversationList = [];
    this.usersList = [];
    this.onLoad();
    this.indexOnConversationList = -1;
    this.activeChatName =
      CookieService.getCookieByKey(CookieService.Keys.lastChat) || "";
    this.selectedRoom = "";
  }

  static styles = css`
    * {
      box-sizing: border-box;
      padding: 0;
      margin: 0;
    }

    .conversation-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-right: 3px;
    }

    .container {
      max-height: 806px;
      display: flex;
      flex-direction: column;
      overflow-y: scroll;
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
      background-color: rgb(54, 123, 251);
    }

    .conversation {
      margin-right: 3px;
      border-radius: 0px 7px 7px 0px;
      transition: background-color 0.2s;
    }

    .conversation:hover {
      background-color: #1460b1;
    }

    .active {
      background-color: #1460b1;
    }

    .separator {
      padding: 5px 0px 5px 10px;
      color: #d6d6d6;
    }

    .conversation-list-scrollable {
      height: calc(100% - 170px);
      overflow: auto;
    }
  `;

  render() {
    return html`
      <il-search
        @search-chat=${this.searchChat}
        @keyPressed=${this.arrowNavigation}
      ></il-search>
      <div class="conversation-list-scrollable">
        <div>
          <p class="separator">Conversazioni</p>
          <div class="conversation-list">${this.renderConversationList()}</div>
        </div>
        <div>
          <p class="separator">
            ${this.newConversationList.length > 0 ? "Nuove conversazioni" : ""}
          </p>
          <div class="conversation-list">
            ${this.renderNewConversationList()}
          </div>
        </div>
      </div>
    `;
  }

  arrowNavigation(e) {
    let convListLength = this.conversationListFiltered.length;
    let newConvListLength = this.newConversationListFiltered.length;
    let room;

    if (
      e.detail.key == "ArrowDown" &&
      this.indexOnConversationList < convListLength + newConvListLength - 1
    )
      this.indexOnConversationList++;
    else if (e.detail.key == "ArrowUp" && this.indexOnConversationList > -1)
      this.indexOnConversationList--;

    if (this.indexOnConversationList > -1) {
      room =
        this.indexOnConversationList < convListLength
          ? this.conversationListFiltered[this.indexOnConversationList].roomName
          : this.newConversationListFiltered[
              this.indexOnConversationList - convListLength
            ].roomName;
      this.selectedRoom = room;
    }

    if (e.detail.key == "Enter" && this.indexOnConversationList > -1) {
      this.updateMessages(room);
      this.cleanSearchInput();
      this.activeChatName = room;
      this.indexOnConversationList = -1;
      CookieService.setCookieByKey(CookieService.Keys.lastChat, room);
    }
  }

  searchChat(event) {
    this.query = event.detail.query;
    this.update();
  }

  scrollToTop() {
    let element = this.renderRoot.querySelector(
      "div.conversation-list-scrollable"
    );
    element.scrollTo({ top: 0 });
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
          (user) => user.name == room.description
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
    if (message) {
      let conversationIndex = this.conversationList.findIndex(
        (conversation) => conversation.roomName == message.roomName
      );

      let conversation = this.convertMessageToConversation(message);

      this.conversationList[conversationIndex] = conversation;
      this.conversationList.sort(this.compareTimestamp);
    }

    this.update();
  }

  convertMessageToConversation(message) {
    return {
      roomName: message.roomName,
      avatarLink: null,
      lastMessage: {
        content: message.content,
        timestamp: message.timestamp,
        sender: message.sender,
      },
      unreadMessages: 0,
    };
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
      id: user.id,
    };
  }

  compareTimestamp(a, b) {
    var timestampA = Date.parse(a.lastMessage.timestamp);
    var timestampB = Date.parse(b.lastMessage.timestamp);
    return timestampB - timestampA;
  }

  renderConversationList() {
    this.conversationListFiltered = this.searchConversation(
      this.conversationList
    );

    return this.conversationListFiltered.map((pharmacy, index) => {
      let conversation = new ConversationDto(pharmacy);
      if (
        conversation.lastMessage.content ||
        conversation.roomName == this.activeChatName
      ) {
        return html`<il-conversation
          class=${"conversation " +
          (conversation.roomName == this.activeChatName ||
          conversation.roomName == this.selectedRoom
            ? "active"
            : "")}
          .chat=${conversation}
          @click=${() => {
            this.activeChatName = conversation.roomName;
            this.updateMessages(conversation.roomName);

            CookieService.setCookieByKey(
              CookieService.Keys.lastChat,
              conversation.roomName
            );
            this.chatClicked(conversation.roomName);
            this.update();
            this.cleanSearchInput();
          }}
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

  searchConversation(list) {
    return list.filter((conversation) =>
      conversation.roomName.includes(this.query)
    );
  }

  renderNewConversationList() {
    this.newConversationListFiltered = this.searchConversation(
      this.newConversationList
    );

    return this.newConversationListFiltered.map((pharmacy) => {
      let conversation = new ConversationDto(pharmacy);
      return html`<il-conversation
        class=${"conversation new-conversation " +
        (conversation.roomName == this.activeChatName ||
        conversation.roomName == this.selectedRoom
          ? "active"
          : "")}
        .chat=${conversation}
        @click=${() => {
          this.activeChatName = conversation.roomName;
          this.updateMessages(conversation.roomName);

          CookieService.setCookieByKey(
            CookieService.Keys.lastChat,
            conversation.roomName
          );
          this.chatClicked(conversation.roomName);
          this.cleanSearchInput();
        }}
      ></il-conversation>`;
    });
  }

  chatClicked(chatName) {
    this.dispatchEvent(
      new CustomEvent("chat-clicked", { detail: { roomName: chatName } })
    );
  }

  updateListOnConversationClick(conversation) {
    const roomFormatted = new ConversationDto(conversation);

    let conversationIndex = this.newConversationList.findIndex(
      (conversation) => conversation.roomName == roomFormatted.roomName
    );

    if (conversationIndex == -1) return false;

    this.moveElementToList(
      this.conversationList,
      this.newConversationList,
      conversationIndex
    );
    return true;
  }

  moveElementToList(targetList, sourceList, elementIndex) {
    const elementToMove = sourceList.splice(elementIndex, 1)[0];
    targetList.unshift(elementToMove);
  }

  updateMessages(roomName) {
    this.dispatchEvent(
      new CustomEvent("update-message", {
        detail: {
          roomName: roomName,
        },
        bubbles: true,
        composed: true,
      })
    );

    let messageInput = document
      .querySelector("body > il-app")
      .shadowRoot.querySelector("il-chat")
      .shadowRoot.querySelector("main > section > div > il-input-controls")
      ?.shadowRoot.querySelector(
        "#inputControls > div.container > div > il-input-field"
      )
      .shadowRoot.querySelector("#message-input");

    messageInput?.focus();
  }

  cleanSearchInput() {
    let searchInput = this.shadowRoot
      .querySelector("il-search")
      ?.shadowRoot.querySelector("il-input-ricerca");
    if (searchInput) searchInput.clear();
    this.query = searchInput.value;
    this.update();
  }

  selectChat(selectedChatName) {
    let cookie = CookieService.getCookie();

    for (let conversation of this.conversationList) {
      if (this.chatNameFormatter(conversation.roomName) === selectedChatName) {
        this.activeChatName = conversation.roomName;
        this.updateMessages(this.activeChatName);
        return;
      }
    }

    selectedChatName = this.chatNameRecomposer(
      this.chatNameFormatter(selectedChatName),
      cookie.username
    );

    this.activeChatName = selectedChatName;
    this.updateMessages(this.activeChatName);

    this.update();
  }

  chatNameRecomposer(user1, user2) {
    let array = [user1, user2].sort();

    return array.join("-");
  }

  chatNameFormatter(chatName) {
    let cookie = CookieService.getCookie();
    if (chatName.includes("-")) {
      chatName = chatName.split("-");
      chatName.splice(chatName.indexOf(cookie.username), 1);
      return chatName[0];
    }
    return chatName;
  }
}

customElements.define("il-conversation-list", ConversationList);
