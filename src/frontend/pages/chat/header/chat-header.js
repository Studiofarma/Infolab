import { LitElement, html, css } from "lit";
import { ref, createRef } from "lit/directives/ref.js";

import "./profile-settings";
import "../../../components/button-icon";
import "../../../components/modal";
import { UsersService } from "../../../services/users-service";
import { CookieService } from "../../../services/cookie-service";

export class ChatHeader extends LitElement {
  static get properties() {
    return {
      userName: "",
      activeDescription: "",
      usersList: [],
      otherUser: {},
    };
  }

  constructor() {
    super();
    this.cookie = CookieService.getCookie();
    this.getAllUsers();
    this.usersList = [];
    this.customDescription = "";
    this.modalRef = createRef();
  }

  updated() {
    this.getUserByDesc(this.activeDescription);
  }

  static styles = css`
    .chatHeader {
      background: #083c72;
      height: 40px;
      padding: 15px 30px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: white;
      position: fixed;
      width: calc(100vw - 400px);
      border-bottom: 1px solid black;
      z-index: 1000;
    }

    .chatHeader .contact {
      order: 1;
      display: flex;
      gap: 1em;
    }

    .contact {
      width: 100%;
      display: flex;
      justify-content: space-between;
    }

    .profileContainer {
      display: flex;
    }

    .profileContainer il-avatar {
      vertical-align: center;
      padding: 15px;
    }

    .profileContainer:last-of-type {
      cursor: pointer;
    }

    il-modal {
      position: fixed;
    }
  `;

  render() {
    return html`
      <div class="chatHeader">
        <div class="contact">
          <div class="profileContainer">
            ${this.activeDescription !== ""
              ? html` <il-avatar
                    .user=${this.otherUser}
                    name=${this.activeDescription}
                    .id=${this.getUserId(this.activeDescription)}
                  ></il-avatar>
                  <h2>${this.activeDescription}</h2>`
              : html``}
          </div>

          <div class="profileContainer" @click=${this.openSettingsMenu}>
            <il-avatar
              name=${this.getDescription()}
              .id="${this.getUserId(this.userName)}"
            ></il-avatar>
            <h2>${this.getDescription()}</h2>
          </div>

          <il-modal
            ${ref(this.modalRef)}
            theme="profile-settings"
            .closeByBackdropClick=${false}
          >
            <il-profile-settings
              currentUsername=${this.getDescription()}
              username=${this.getDescription()}
              @set-new-description=${this.setNewDescription}
              @close-menu=${this.closeProfileMenu}
            ></il-profile-settings>
          </il-modal>
        </div>
      </div>
    `;
  }

  openSettingsMenu() {
    this.modalRef.value.ilDialogRef.value.openDialog();
  }

  closeProfileMenu(event) {
    this.modalRef.value.ilDialogRef.value.closeDialog();
  }

  setNewDescription(event) {
    this.customDescription = event.detail.newDescription;
    this.requestUpdate();

    this.dispatchEvent(new CustomEvent(event.type, { detail: event.detail }));
  }

  getUserId(userName) {
    let userIndex = this.usersList.findIndex(
      (user) => user.description == userName
    );
    if (userIndex < 0) return;
    let user = this.usersList[userIndex];
    return user.id;
  }

  getDescription() {
    return this.customDescription !== ""
      ? this.customDescription
      : this.getUserDescription(this.userName);
  }

  getUserDescription(userName) {
    let userIndex = this.usersList.findIndex((user) => user.name == userName);
    if (userIndex < 0) return;
    let user = this.usersList[userIndex];
    return user.description;
  }

  async getAllUsers() {
    try {
      await UsersService.GetUsers(
        "",
        this.cookie.username,
        this.cookie.password
      ).then((users) => {
        this.usersList = users["data"];
      });
    } catch (error) {
      console.error(error);
    }
  }

  getUserByDesc(description) {
    let userIndex = this.usersList.findIndex(
      (user) => user.description == description
    );
    if (userIndex < 0) {
      this.otherUser = undefined;
      return;
    }
    this.otherUser = this.usersList[userIndex];
  }
}

customElements.define("il-chat-header", ChatHeader);
