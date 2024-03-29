import { html, css } from "lit";
import { ref, createRef } from "lit/directives/ref.js";
import { when } from "lit/directives/when.js";

import "./profile-settings";
import "../../../components/button-icon";
import "../../../components/modal";
import { UsersService } from "../../../services/users-service";
import { ThemeColorService } from "../../../services/theme-color-service";

import { ThemeCSSVariables } from "../../../enums/theme-css-variables";

import { BaseComponent } from "../../../components/base-component";

export class ChatHeader extends BaseComponent {
  static get properties() {
    return {
      otherUser: {},
      loggedUser: {},
      conversation: {},
      canFetchLoggedUser: false,
      userInvalidated: false,
    };
  }

  constructor() {
    super();

    this.isFirstFetch = true;
    this.descriptionChanged = false;
    this.userInvalidated = false;

    // Refs
    this.modalRef = createRef();
    this.profileSettingsRef = createRef();
    this.loggedUserAvatarRef = createRef();
  }

  async updated(changedProperties) {
    if (this.canFetchLoggedUser && this.isFirstFetch) {
      this.loggedUser = await UsersService.getLoggedUser();
      this.isFirstFetch = false;
    } else if (
      changedProperties.has("userInvalidated") &&
      this.userInvalidated
    ) {
      this.loggedUser = await UsersService.getLoggedUser();
      this.userInvalidated = false;
      this.loggedUserAvatarRef.value?.requestUpdate();
    }
  }

  static styles = css`
    * {
      ${ThemeColorService.getThemeVariables()};
    }

    .chatHeader {
      background: ${ThemeCSSVariables.headerBg};
      height: 40px;
      padding: 15px 30px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: ${ThemeCSSVariables.headerColor};
      position: fixed;
      width: calc(100vw - 400px);
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
      width: 400px;
      max-width: 100%;
      height: 90vh;
      overflow-y: hidden;
    }
  `;

  render() {
    return html`
      <div class="chatHeader">
        <div class="contact">
          <div class="profileContainer">
            ${when(
              this.conversation?.description !== undefined,
              () =>
                html` <il-avatar
                    .user=${this.otherUser}
                    .conversation=${this.conversation}
                  ></il-avatar>
                  <h2>${this.conversation?.description}</h2>`,
              () => html``
            )}
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

          <il-modal ${ref(this.modalRef)} .isClosableByBackdropClick=${false}>
            <div class="profile-modal">
              <il-profile-settings
                ${ref(this.profileSettingsRef)}
                .user=${this.loggedUser}
                currentUserDescription=${this.loggedUser?.description}
                currentAvatarURL=${this.loggedUser?.avatarLink}
                userDescription=${this.loggedUser?.description}
                @il:new-description-set=${this.newDescriptionSetHandler}
                @il:new-avatar-set=${this.newAvatarSetHandler}
                @il:menu-closed=${this.closeProfileMenu}
              ></il-profile-settings>
            </div>
          </il-modal>
        </div>
      </div>
    `;
  }

  openSettingsMenu() {
    this.modalRef.value?.setDialogRefIsOpened(true);
    this.profileSettingsRef.value?.focus();
  }

  closeProfileMenu() {
    this.modalRef.value?.setDialogRefIsOpened(false);
  }

  newDescriptionSetHandler(e) {
    UsersService.updateLoggedUserInSessionStorage({
      description: e.detail.newDescription,
    });
    this.userInvalidated = true;
    this.requestUpdate();
  }

  newAvatarSetHandler() {
    const link = this.loggedUser.avatarLink;

    if (link) {
      UsersService.updateLoggedUserInSessionStorage({
        avatarLink: `${link.substring(
          0,
          link.indexOf("cacheInvalidator")
        )}cacheInvalidator=${new Date().toISOString()}`,
      });
    } else {
      UsersService.deleteLoggedUserFromSessionStorage();
    }
    this.userInvalidated = true;
    this.requestUpdate();
  }

  setConversation(conversation) {
    this.conversation = conversation;
  }

  setOtherUser(user) {
    this.otherUser = user;
  }

  getOtherUser() {
    return this.otherUser;
  }
}

customElements.define("il-chat-header", ChatHeader);
