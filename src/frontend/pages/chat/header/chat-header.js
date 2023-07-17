import { LitElement, html, css, adoptStyles } from "lit";
import { ref, createRef } from "lit/directives/ref.js";
import { when } from "lit/directives/when.js";

import "./profile-settings";
import "../../../components/button-icon";
import "../../../components/modal";
import { UsersService } from "../../../services/users-service";
import { CookieService } from "../../../services/cookie-service";
import { ThemeColorService } from "../../../services/theme-color-service";

import { ThemeCSSVariables } from "../../../enums/theme-css-variables";

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
    this.loggedUser = await UsersService.getLoggedUser();
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
      width: 700px;
      height: fit-content;
    }
  `;

  connectedCallback() {
    super.connectedCallback();

    document.addEventListener("change-theme", () => {
      // changing the adoptedStylesheet
      let stylesheet = this.shadowRoot.adoptedStyleSheets[0];
      let rules = stylesheet.cssRules;

      let index = Object.values(rules).findIndex(
        (rule) => rule.selectorText === "*"
      );

      let newSelectorText = `
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    ${ThemeColorService.getThemeVariables().toString()};
  }`;

      stylesheet.deleteRule(index);
      stylesheet.insertRule(newSelectorText, index);

      adoptStyles(this.shadowRoot, [stylesheet]);
    });
  }

  render() {
    return html`
      <div class="chatHeader">
        <div class="contact">
          <div class="profileContainer">
            ${when(
              this.conversation?.description !== undefined,
              () => html` <il-avatar
                  .user=${this.otherUser}
                  .conversation=${this.conversation}
                  name=${this.conversation?.description}
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
                currentUsername=${this.loggedUser?.description}
                currentAvatarURL=${this.loggedUser?.avatarLink}
                username=${this.loggedUser?.description}
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

  newDescriptionSetHandler() {}

  newAvatarSetHandler() {}

  setConversation(conversation) {
    this.conversation = conversation;
  }

  setOtherUser(user) {
    this.otherUser = user;
  }
}

customElements.define("il-chat-header", ChatHeader);
