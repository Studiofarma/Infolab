import { LitElement, html, css } from "lit";
export class Avatar extends LitElement {
  static get properties() {
    return {
      avatarLink: "",
      name: "",
      id: 0,
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

    for (let i = 0; i < words.length; i++) {
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
        this.color = "#08c771";
        break;
      case 1:
        this.color = "#008A33";
        break;
      case 2:
        this.color = "#00b8bd";
        break;
      case 3:
        this.color = "#ff6961";
        break;
      case 4:
        this.color = "#dc2093";
        break;
      case 5:
        this.color = "#31ba00";
        break;
      case 6:
        this.color = "#E48B0E";
        break;
      case 7:
        this.color = "#11cd00";
    }
  }

  render() {
    this.createIcon();

    return html`
      <div class="avatar">
        ${this.defaultAvatar
          ? html`<img src=${this.avatarLink} />`
          : html`<div
              id="avatar-default"
              style="background-color:${this.color}"
            >
              ${this.initials}
            </div>`}
      </div>
    `;
  }
}

customElements.define("il-avatar", Avatar);
