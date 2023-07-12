import { LitElement, html, css } from "lit";
import { when } from "lit/directives/when.js";
import { choose } from "lit/directives/choose.js";

import { ThemeColorService } from "../services/theme-color-service";

import "./icon";
import { IconNames } from "../enums/icon-names";
import { ThemeCSSVariables } from "../enums/theme-css-variables";

const maxInitials = 3;

export class Avatar extends LitElement {
  static get properties() {
    return {
      avatarLink: "",
      name: "",
      selected: false,
      sizeClass: "",
      user: {},
      conversation: {},
      hasStatus: true,
    };
  }

  static styles = css`
    * {
      ${ThemeColorService.getThemeVariables()};
    }

    img {
      border-radius: 50%;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    #avatar-default {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: hidden;
    }

    .icon-button {
      height: 24px;
      width: 23px;
      border-radius: 23px;
      background-color: ${ThemeCSSVariables.statusBorder};
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 0px;
      -webkit-font-smoothing: antialiased;
      user-select: none;
      position: relative;
      left: 30px;
      bottom: 15px;
    }

    .avatar {
      height: 50px;
    }

    .large {
      width: 150px !important;
      height: 150px !important;
      color: ${ThemeCSSVariables.initialsText};
      font-size: 50px;
    }

    .online {
      color: ${ThemeCSSVariables.onlineStatus};
    }

    .offline {
      color: ${ThemeCSSVariables.offlineStatus};
    }
  `;

  constructor() {
    super();
    this.initials = "";
    this.color = "";
    this.defaultAvatar = true;
    this.hasStatus = this.hasStatus === undefined ? true : this.hasStatus;
  }

  getInitials(text) {
    if (text === undefined) return;
    const words = text.split(" ");
    let initials = "";

    const initialsCount =
      words.length < maxInitials ? words.length : maxInitials;

    for (let i = 0; i < initialsCount; i++) {
      const word = words[i];
      initials += word.charAt(0);
    }

    return initials.toUpperCase();
  }

  createIcon() {
    if (this.avatarLink || this.user?.avatarLink) {
      this.defaultAvatar = true;
    } else {
      this.defaultAvatar = false;
    }
    this.initials = this.getInitials(
      this.name ?? this.user?.description ?? this.conversation?.description
    );
    switch (
      (this.user?.id ?? this.conversation?.id) % 8 // Note that the BE doesn't return ID, yet it is inside the dto. By default it is 0.
    ) {
      case 0:
        this.color = `${ThemeCSSVariables.avatarBg0}`;
        break;
      case 1:
        this.color = `${ThemeCSSVariables.avatarBg1}`;
        break;
      case 2:
        this.color = `${ThemeCSSVariables.avatarBg2}`;
        break;
      case 3:
        this.color = `${ThemeCSSVariables.avatarBg3}`;
        break;
      case 4:
        this.color = `${ThemeCSSVariables.avatarBg4}`;
        break;
      case 5:
        this.color = `${ThemeCSSVariables.avatarBg5}`;
        break;
      case 6:
        this.color = `${ThemeCSSVariables.avatarBg6}`;
        break;
      case 7:
        this.color = `${ThemeCSSVariables.avatarBg7}`;
    }
  }

  render() {
    this.createIcon();

    return html`
      <div class=${"avatar " + this.sizeClass}>
        ${when(
          this.defaultAvatar,
          () => html`<img src=${this.avatarLink ?? this.user?.avatarLink} />`,
          () => html`<div
            class=${this.sizeClass}
            id="avatar-default"
            style="background-color: ${this.color}"
          >
            ${this.initials}
          </div>`
        )}
        ${when(
          this.selected,
          () => html`<div class="icon-button">
            <il-icon name=${IconNames.checkCircle}></il-icon>
          </div>`,
          () =>
            when(this.hasStatus, () =>
              choose(
                this.user?.status,
                [
                  [
                    "online",
                    () =>
                      html`<il-icon
                        class="icon-button online"
                        name=${IconNames.circle}
                      ></il-icon>`,
                  ], // TODO: change name and color
                  [
                    "offline",
                    () =>
                      html`<il-icon
                        class="icon-button offline"
                        name=${IconNames.circle}
                      ></il-icon>`,
                  ],
                ],
                () => html``
              )
            )
        )}
      </div>
    `;
  }

  setAvatarLink(avatarLink) {
    this.user.avatarLink = avatarLink;
    this.defaultAvatar = false;
    this.requestUpdate();
  }
}

customElements.define("il-avatar", Avatar);
