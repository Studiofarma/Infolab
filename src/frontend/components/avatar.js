import { LitElement, html, css } from "lit";
import Immagine from "../assets/images/immagine.jpeg";
const axios = require("axios").default;

export class Avatar extends LitElement {
  static get properties() {
    return {
      avatar: "",
      name: "",
      id_user: "",
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

  async executePharmaciesCall() {
    return axios({
      url: "http://localhost:3000/users",
      method: "get",
      headers: {
        "X-Requested-With": "XMLHttpRequest",
      },
    });
  }

  constructor() {
    super();
    this.initials = "";
    this.avatar = "";
    this.name = "";
    this.color = "";
    this.id_user = "";
    this.bAvatar = true;
  }

  render() {
    if (this.avatar == "#") {
      this.bAvatar = false;
      this.name.split(" ").forEach((s) => {
        this.initials += s[0];
      });
      switch (this.id_user % 8) {
        case 0:
          this.color = "#083C72";
          break;
        case 1:
          this.color = "#00234F";
          break;
        case 2:
          this.color = "#008A33";
          break;
        case 3:
          this.color = "#005B13";
          break;
        case 4:
          this.color = "#DC2042";
          break;
        case 5:
          this.color = "#C1002E";
          break;
        case 6:
          this.color = "#E48B0E";
          break;
        case 7:
          this.color = "#A66100";
      }
    }

    return html`
      <div class="avatar">
        ${this.bAvatar
          ? html`<img src=${Immagine} />`
          : html`<div
              id="avatar-default"
              style="background-color: ${this.color}"
            >
              ${this.initials}
            </div>`}
      </div>
    `;
  }
}

customElements.define("il-avatar", Avatar);
