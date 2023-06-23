import { LitElement, html, css } from "lit";

import "../../../components/button-icon";
import { UsersService } from "../../../services/users-service";
import { CookieService } from "../../../services/cookie-service";

export class ChatHeader extends LitElement {
  static get properties() {
    return {
      userName: "",
      roomName: "",
      usersList: [],
    };
  }

  constructor() {
    super();
    this.getAllUsers();
    this.usersList = [];
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
  `;

  render() {
    return html`
      <div class="chatHeader">
        <div class="contact">
          ${this.roomName == ""
            ? html`<div></div>` //metto un placeholder per far allineare a destra il profilo utente con il diplay flex
            : html`<div class="profileContainer">
                <il-avatar
                  name=${this.roomName}
                  .id=${this.getUserId(this.roomName)}
                ></il-avatar>
                <h2>${this.roomName}</h2>
              </div>`}

          <div class="profileContainer">
            <h2>${this.userName}</h2>
            <il-avatar
              name=${this.userName}
              .id="${this.getUserId(this.userName)}"
            ></il-avatar>
          </div>
        </div>
      </div>
    `;
  }

  getUserId(userName) {
    let userIndex = this.usersList.findIndex((user) => user.name == userName);
    if (userIndex < 0) return;
    let user = this.usersList[userIndex];
    return user.id;
  }

  async getAllUsers() {
    let cookie = CookieService.getCookie();
    try {
      await UsersService.GetUsers("", cookie.username, cookie.password).then(
        (users) => {
          this.usersList = users["data"];
        }
      );
    } catch (error) {
      console.error(error);
    }
  }
}

customElements.define("il-chat-header", ChatHeader);
