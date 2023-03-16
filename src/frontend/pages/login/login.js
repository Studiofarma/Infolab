import { LitElement, html, css } from "lit";
const axios = require("axios").default;

import "../../components/snackbar";
import "../../components/button-icon";
import "../../components/button-text";

const USERNAME_COOKIE_NAME = "username";
const PASSWORD_COOKIE_NAME = "password";
const HEADER_COOKIE_NAME = "header";
const TOKEN_COOKIE_NAME = "token";
export class Login extends LitElement {
  static properties = {
    username: "",
    password: "",
    pswVisibility: false,
    emptyUsernameField: false,
    emptyPasswordField: false,
    header: "",
    token: "",
    cookie: false,
  };

  constructor() {
    super();
    this.username = "user1";
    this.password = "password1";
    this.pswVisibility = false;
    this.emptyUsernameField = false;
    this.emptyPasswordField = false;
    this.header = "";
    this.token = "";
    this.cookie = this.getCookie();
    if (this.cookie) this.loginConfirm();
  }

  static styles = css`
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    #container {
      position: relative;
      width: 500px;
      max-width: 100%;
      min-height: 400px;
      background: white;
      padding: 1.5rem 2rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      border-radius: 10px;
      background-color: #e4e8ee;
      overflow: hidden;
    }

    div[class^="ring"] {
      position: absolute;
      background: #083c72;
      width: 250px;
      height: 250px;
      border-radius: 100%;
      z-index: 1;
      overflow: hidden;
    }

    .ring1 {
      top: 0;
      left: 0;
      transform: translate(-50%, -50%);
    }

    div[class^="ring"]::before {
      content: "";
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 200px;
      height: 200px;
      background: #e4e8ee;
      border-radius: 100%;
    }

    .ring2 {
      bottom: 0;
      right: 0;
      transform: translate(50%, 50%);
    }

    #container > *:not(div[class^="ring"]) {
      z-index: 2;
    }

    .title {
      align-self: center;
    }

    input[type="text"],
    input[type="password"] {
      position: relative;
      width: 100%;
      height: 40px;
      padding: 5px 10px;
      border: none;
      outline: none;
      font-size: 15pt;
      transition: 0.5s;
      margin-top: 10px;
      border-radius: 10px;
      box-shadow: 0 0 10px #333333;
    }

    .text-container {
      position: relative;
    }

    .text-container il-button-icon {
      position: absolute;
      transform: translateY(50%);
      bottom: 20px;
      right: 10px;
      z-index: 2;
      color: rgba(10, 10, 128, 0.829);
      opacity: 0;
      transition: 0.5s;
    }

    .text-container:hover il-button-icon {
      opacity: 1;
      visibility: visible;
      cursor: pointer;
    }

    label[id$="Error"] {
      display: block;
      color: darkred;
      padding-top: 5px;
      font-size: 10pt;
    }

    input,
    button {
      font-family: inherit;
    }

    .text-container::before {
      content: "";
      position: absolute;
      top: 5px;
      left: -2.5px;
      border-radius: 10px;
      width: calc(100% + 6px);
      height: 100%;
      background: #c1002e;
      z-index: -1;
      transition: 0.5s;
      scale: 0;
    }

    .text-container:has(input.error)::before {
      scale: 1;
    }

    .text-container::after {
      content: "!";
      position: absolute;
      transform: translateY(50%);
      bottom: 20px;
      right: 10px;
      z-index: 2;
      width: 20px;
      height: 20px;
      padding: 5px;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      color: white;
      background: #c1002e;
      transition: 0.5s;
      transition-delay: 0.5s;
      opacity: 0;
    }

    .text-container:has(input.error)::after {
      opacity: 1;
    }

    .text-container:hover::after {
      display: none;
    }
  `;

  getCookiePropertyByName(name) {
    const result = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${name}=`))
      ?.split("=")[1];

    return result;
  }

  getCookie() {
    const user = this.getCookiePropertyByName(USERNAME_COOKIE_NAME);
    if (!user) return false;

    const pass = this.getCookiePropertyByName(PASSWORD_COOKIE_NAME);
    if (!pass) return false;

    const header = this.getCookiePropertyByName(HEADER_COOKIE_NAME);
    if (!header) return false;

    const token = this.getCookiePropertyByName(TOKEN_COOKIE_NAME);
    if (!token) return false;

    this.username = user;
    this.password = pass;
    this.header = header;
    this.token = token;

    return true;
  }

  setCookie() {
    let expires = new Date(Date.now());
    expires.setDate(expires.getDate() + 1);
    document.cookie = `${USERNAME_COOKIE_NAME}=${this.username}; expires=${expires}; `;
    document.cookie = `${PASSWORD_COOKIE_NAME}=${this.password}; expires=${expires}; `;
    document.cookie = `${HEADER_COOKIE_NAME}=${this.header}; expires=${expires}; `;
    document.cookie = `${TOKEN_COOKIE_NAME}=${this.token}; expires=${expires}; `;
  }

  render() {
    return html`
      <div id="container">
        <div class="ring1"></div>
        <div class="ring2"></div>

        <h1 class="title">WELCOME BACK</h1>

        <div>
          <label>
            Username
            <div class="text-container">
              <input
                class=${this.emptyUsernameField ? "error" : ""}
                id="username"
                type="text"
                @input=${this.onUsernameInput}
                @keydown=${this.checkEnterKey}
                .value=${this.username}
                placeholder="Inserisci lo username"
              />
            </div>
          </label>
        </div>

        <div>
          <label>
            Password
            <div class="text-container">
              <input
                class=${this.emptyPasswordField ? "error" : ""}
                id="password"
                type=${this.pswVisibility ? "text" : "password"}
                @input=${this.onPasswordInput}
                @keydown=${this.checkEnterKey}
                .value=${this.password}
                placeholder="Inserisci la password"
              />

              <il-button-icon
                @click=${this.setVisibility}
                content="${!this.pswVisibility ? "mdiEye" : "mdiEyeOff"}"
              ></il-button-icon>
            </div>
          </label>
        </div>
        <div>
          <il-button-text
            @click=${this.loginConfirm}
            text="Connetti"
          ></il-button-text>
        </div>
      </div>

      <il-snackbar content="CREDENZIALI NON VALIDE" type="error"></il-snackbar>
    `;
  }

  getDivInSnackbar() {
    return (
      this.renderRoot
        .querySelector("il-snackbar")
        .shadowRoot.querySelector("#snackbar") ?? null
    );
  }

  onUsernameInput(e) {
    const inputEl = e.target;
    this.username = inputEl.value;
  }

  onPasswordInput(e) {
    const inputEl = e.target;
    this.password = inputEl.value;
  }

  checkEnterKey(e) {
    if (e.key === "Enter") this.loginConfirm();
  }

  setVisibility() {
    this.pswVisibility = !this.pswVisibility;
  }

  loginConfirmEvent() {
    this.dispatchEvent(
      new CustomEvent("login-confirm", {
        detail: {
          login: {
            username: this.username,
            password: this.password,
            headerName: this.header,
            token: this.token,
          },
        },
      })
    );
  }

  loginConfirm() {
    if (this.cookie) {
      Promise.resolve().then(() => {
        this.loginConfirmEvent();
      });
      return;
    }

    if (this.username === "" && this.password === "") {
      this.emptyUsernameField = true;
      this.emptyPasswordField = true;
      return;
    }

    if (this.username === "") {
      this.emptyUsernameField = true;
      return;
    }

    if (this.password === "") {
      this.emptyPasswordField = true;
      return;
    }

    this.executeLoginCall()
      .then((response) => {
        this.header = response.data.headerName;
        this.token = response.data.token;
        this.setCookie();
        this.loginConfirmEvent();
      })
      .catch((e) => {
        this.emptyUsernameField = false;
        this.emptyPasswordField = false;
        this.getDivInSnackbar().style.opacity = 1.0;
        this.getDivInSnackbar().style.bottom = "20px";
      });
  }

  async executeLoginCall() {
    return axios({
      url: "/csrf",
      method: "get",
      headers: {
        "X-Requested-With": "XMLHttpRequest",
      },
      auth: {
        username: this.username,
        password: this.password,
      },
    });
  }
}

customElements.define("il-login", Login);
