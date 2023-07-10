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
    this.modalRef = createRef();
    this.profileSettingsRef = createRef();
    this.loggedUserAvatarRef = createRef();
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

    .profile-modal {
      width: 700px;
      height: fit-content;
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
              name=${this.getUserDescription(this.userName)}
              .id="${this.getUserId(this.userName)}"
              ${ref(this.loggedUserAvatarRef)}
            ></il-avatar>
            <h2>${this.getUserDescription(this.userName)}</h2>
          </div>

          <il-modal ${ref(this.modalRef)} .closeByBackdropClick=${false}>
            <div class="profile-modal">
              <il-profile-settings
                ${ref(this.profileSettingsRef)}
                currentUsername=${this.getUserDescription(this.userName)}
                currentAvatarURL=${this.loggedUser?.avatarLink}
                username=${this.getUserDescription(this.userName)}
                @set-new-description=${this.setNewDescription}
                @set-new-avatar=${this.setNewAvatar}
                @close-menu=${this.closeProfileMenu}
              ></il-profile-settings>
            </div>
          </il-modal>
        </div>
      </div>
    `;
  }

  openSettingsMenu() {
    this.modalRef.value?.openModal();
    this.profileSettingsRef.value?.setIsFocus();
  }

  closeProfileMenu(event) {
    this.modalRef.value?.closeModal();
  }

  setNewDescription() {}

  setNewAvatar() {}

  getUserId(userName) {
    let userIndex = this.usersList.findIndex(
      (user) => user.description == userName
    );
    if (userIndex < 0) return;
    let user = this.usersList[userIndex];
    return user.id;
  }

  getUserDescription(userName) {
    let userIndex = this.usersList.findIndex((user) => user.name == userName);
    if (userIndex < 0) return;
    let user = this.usersList[userIndex];
    return user.description;
  }

  async getAllUsers() {
    try {
      this.usersList = await UsersService.getUsers(
        "",
        this.cookie.username,
        this.cookie.password
      );
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
