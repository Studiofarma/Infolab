import { LitElement, html, css } from "lit";
import { createRef, ref } from "lit/directives/ref.js";

import "./conversation/conversation-list";

export class Sidebar extends LitElement {
  static properties = {
    login: {
      username: "",
      password: "",
      headerName: "",
      token: "",
    },
  };

  constructor() {
    super();
    // Refs
    this.sidebarListRef = createRef();
  }

  static styles = css`
    .side-bar {
      background: #f2f4f7;
      color: white;
      display: flex;
      flex-direction: column;
      height: 100vh;
      width: 350px;
      box-shadow: 2px 0 8px #b7b9bd;
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
      <div class="side-bar">
        <il-conversation-list
          ${ref(this.sidebarListRef)}
          class="conversation-list"
          @update-message=${(event) =>
            this.dispatchEvent(
              new CustomEvent(event.type, { detail: event.detail })
            )}
          @change-conversation=${(event) =>
            this.dispatchEvent(
              new CustomEvent(event.type, { detail: event.detail })
            )}
        ></il-conversation-list>
      </div>
    `;
  }

  changeRoom(event, conversation) {
    this.sidebarListRef.value?.changeRoom(event, conversation);
  }

  findConversation(username) {
    return this.sidebarListRef.value?.findConversation(username);
  }
  // getters & setters

  getSidebarListRefActiveChatName() {
    return this.sidebarListRef.value?.getActiveChatName();
  }

  setSidebarListRefActiveChatName(value) {
    this.sidebarListRef.value?.setActiveChatName(value);
  }

  getSidebarListRefActiveDescription() {
    return this.sidebarListRef.value?.getActiveDescription();
  }

  setSidebarListRefActiveDescription(value) {
    this.sidebarListRef.value?.setActiveDescription(value);
  }

  getSidebarListRefConversationList() {
    return [...this.sidebarListRef.value?.getConversationList()];
  }

  getSidebarListRefNewConversationList() {
    return [...this.sidebarListRef.value?.getNewConversationList()];
  }

  // -----------------------------------

  setList(message) {
    this.sidebarListRef.value?.setList(message);
  }
}

customElements.define("il-sidebar", Sidebar);
