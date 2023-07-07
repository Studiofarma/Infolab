import { LitElement, html, css } from "lit";
import { when } from "lit/directives/when.js";
import { choose } from "lit/directives/choose.js";

import "./icon";
import { IconNames } from "../enums/icon-names";

const maxInitials = 3;

export class Avatar extends LitElement {
  static get properties() {
    return {
      avatarLink: "",
      name: "",
      id: 0,
      selected: false,
      sizeClass: "",
      user: {},
    };
  }

  static styles = css`
    img,
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
      background-color: white;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 0px;
      -webkit-font-smoothing: antialiased;
      user-select: none;
      color: #206cf7;
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
      color: white;
      font-size: 50px;
    }

    .online {
      color: #68c47e;
    }

    .offline {
      color: #dbdde0;
    }
  `;

  constructor() {
    super();
    this.initials = "";
    this.color = "";
    this.defaultAvatar = true;
  }

  getInitials(text) {
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
    if (this.avatarLink) {
      this.defaultAvatar = true;
    } else {
      this.defaultAvatar = false;
    }
    this.initials = this.getInitials(this.name);
    switch ((this.id || 0) % 8) {
      case 0:
        this.color = "#008A33";
        break;
      case 1:
        this.color = "#005B13";
        break;
      case 2:
        this.color = "#EF2C49";
        break;
      case 3:
        this.color = "#CF173A";
        break;
      case 4:
        this.color = "#F0981D";
        break;
      case 5:
        this.color = "#CF7A04";
        break;
      case 6:
        this.color = "#003366";
        break;
      case 7:
        this.color = "#5C5E60";
    }
  }

  render() {
    this.createIcon();

    return html`
      <div class=${"avatar " + this.sizeClass}>
        ${when(
          this.defaultAvatar,
          () => html`<img src=${this.avatarLink} />`,
          () => html`<div
            class=${this.sizeClass}
            id="avatar-default"
            style="background-color:${this.color}"
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
        )}
      </div>
    `;
  }
}

customElements.define("il-avatar", Avatar);
