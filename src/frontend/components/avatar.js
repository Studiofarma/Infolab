import { LitElement, html, css } from "lit";
import Immagine from "../assets/images/immagine.jpeg";
const axios = require("axios").default;

export class Avatar extends LitElement {
  static properties = {
    users: [],
  };

  static styles = css`
    .avatar {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: hidden;
    }

    .avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
    }
  `;

  async executePharmaciesCall() {
    return axios({
      url: "http://localhost:3000/pharmacies",
      method: "get",
      headers: {
        "X-Requested-With": "XMLHttpRequest",
      },
    });
  }

  constructor() {
    super();
    // this.users = this.executePharmaciesCall()
    //   .then((element) =>
    //     element.forEach((e) => {
    //       this.users.push(e);
    //     })
    //   )
    //   .catch((e) => console.log(e));
  }

  render() {
    console.log(this.users);
    return html`
      <div class="avatar">
        <img src=${Immagine} />
      </div>
    `;
  }
}

customElements.define("il-avatar", Avatar);
