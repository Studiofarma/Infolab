import { LitElement, html, css } from "lit";

import { LoginService } from "../../services/login-service";
import { CookieService } from "../../services/cookie-service";

import "../../components/snackbar";
import "../../components/button-icon";
import "../../components/button-text";
import "../../components/input-field";
import "../../components/input-password";

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
    this.username = "";
    this.password = "";
    this.pswVisibility = false;
    this.emptyUsernameField = false;
    this.emptyPasswordField = false;
    this.header = "";
    this.token = "";
    this.cookie = CookieService.getCookie();
    if (this.cookie.isValid) this.loginConfirm();
  }

  static styles = css`
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    #container {
      position: relative;
      width: 530px;
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

    .text-container {
      position: relative;
      width: 100%;
      margin-bottom: 10px;
    }

    .text-container il-button-icon {
      position: absolute;
      transform: translateY(50%);
      bottom: 25px;
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

    #submit_btn {
      text-transform: uppercase;
      padding: 15px 20px;
      color: #e4e8ee;
      background: #00234f;
      border: none;
      outline: none;
      cursor: pointer;
      border-radius: 10px;
      width: 150px;
      margin-top: 30px;
    }

    input {
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

    #input-container {
      text-align: center;
    }
  `;

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
        <div id="input-container">
          <div class="text-container">
            <il-input-field
              class=${this.emptyUsernameField ? "error" : ""}
              id="username"
              type="text"
              @input=${this.onUsernameInput}
              @keydown=${this.checkEnterKey}
              placeholder="Inserisci lo username"
              title="Username"
            ></il-input-field>
          </div>

          <div class="text-container">
            <il-input-password
              class=${this.emptyPasswordField ? "error" : ""}
              id="password"
              @input=${this.onPasswordInput}
              @keydown=${this.checkEnterKey}
              placeholder="Inserisci la password"
              title="Password"
            ></il-input-password>
          </div>
          <div>
            <il-button-text
              @click=${this.loginConfirm}
              text="Connetti"
            ></il-button-text>
          </div>
        </div>

        <il-snackbar
          content="CREDENZIALI NON VALIDE"
          type="error"
        ></il-snackbar>
      </div>
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
    if (this.cookie.isValid) {
      this.username = this.cookie.username;
      this.password = this.cookie.password;
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

    LoginService.getLogin(this.username, this.password)
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
}

customElements.define("il-login", Login);
