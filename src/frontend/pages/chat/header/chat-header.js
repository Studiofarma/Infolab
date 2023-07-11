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
      otherUser: {},
      loggedUser: {},
      conversation: {},
    };
  }

  constructor() {
    super();
    this.cookie = CookieService.getCookie();

    // Refs
    this.modalRef = createRef();
    this.profileSettingsRef = createRef();
    this.loggedUserAvatarRef = createRef();
  }

  async firstUpdated() {
    this.loggedUser = await UsersService.getLoggedUser(
      this.cookie.username,
      this.cookie.password
    );
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
            ${this.conversation?.description !== undefined
              ? html` <il-avatar
                    .user=${this.otherUser}
                    .conversation=${this.conversation}
                    name=${this.conversation?.description}
                  ></il-avatar>
                  <h2>${this.conversation?.description}</h2>`
              : html``}
          </div>

          <div class="profileContainer" @click=${this.openSettingsMenu}>
            <il-avatar
              .hasStatus=${false}
              .user=${this.loggedUser}
              name=${this.loggedUser?.description}
              ${ref(this.loggedUserAvatarRef)}
            ></il-avatar>
            <h2>${this.loggedUser?.description}</h2>
          </div>

          <il-modal ${ref(this.modalRef)} .closeByBackdropClick=${false}>
            <div class="profile-modal">
              <il-profile-settings
                ${ref(this.profileSettingsRef)}
                .user=${this.loggedUser}
                currentUsername=${this.loggedUser?.description}
                currentAvatarURL=${this.loggedUser?.avatarLink}
                username=${this.loggedUser?.description}
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
    this.modalRef.value?.setDialogRefIsOpened(true);
    this.profileSettingsRef.value?.setIsFocus();
  }

  closeProfileMenu(event) {
    this.modalRef.value?.setDialogRefIsOpened(false);
  }

  setNewDescription() {}

  setNewAvatar() {}

  setConversation(conversation) {
    this.conversation = conversation;
  }

  setUser(user) {
    this.otherUser = user;
  }
}

customElements.define("il-chat-header", ChatHeader);
