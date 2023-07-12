import { LitElement, html, css } from "lit";
import { createRef, ref } from "lit/directives/ref.js";

import { LoginService } from "../../services/login-service";
import { CookieService } from "../../services/cookie-service";
import { ThemeColorService } from "../../services/theme-color-service";

import { VariableNames } from "../../enums/theme-colors";

import "../../components/snackbar";
import "../../components/button-icon";
import "../../components/button-text";
import "../../components/input-field";
import "../../components/input-password";

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
    this.snackbarRef = createRef();
    this.cookie = CookieService.getCookie();
    if (this.cookie.isValid) this.loginConfirm();
  }

  static styles = css`
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      ${ThemeColorService.getThemeVariables()};
      color: ${VariableNames.text};
    }


    #background {
      position: absolute;
      top: 0;
      left:0;
      width: 100%;
      height: 100%;
      background-color: ${VariableNames.loginBg};
      z-index: 1;
    }

    #container {
      position: relative;
      width: 530px;
      max-width: 100%;
      min-height: 400px;
      padding: 1.5rem 2rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      border-radius: 10px;
      background-color: ${VariableNames.loginFieldBg};
      z-index: 2;
      overflow: hidden;
    }

    div[class^="ring"] {
      position: absolute;
      background-color: ${VariableNames.loginBg};
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
      // importo anche qua il servizio per rendere visibili le variabili nello pseudo-elemento
      ${ThemeColorService.getThemeVariables()};
      content: "";
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 200px;
      height: 200px;
      background: ${VariableNames.loginFieldBg};
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
      color: ${VariableNames.iconColor};
      opacity: 0;
      transition: 0.5s;
    }

    .text-container:hover il-button-icon {
      opacity: 1;
      visibility: visible;
      cursor: pointer;
    }

    #input-container {
      text-align: center;
    }
  `;

  setCookie() {
    CookieService.setCookieByKey(CookieService.Keys.username, this.username);
    CookieService.setCookieByKey(CookieService.Keys.password, this.password);
    CookieService.setCookieByKey(CookieService.Keys.header, this.header);
    CookieService.setCookieByKey(CookieService.Keys.token, this.token);
  }

  render() {
    return html`
      <div id="background"></div>
      <div id="container">
        <div class="ring1"></div>
        <div class="ring2"></div>

        <h1 class="title">Benvenuto</h1>
        <div id="input-container">
          <div class="text-container">
            <il-input-field
              class=${this.emptyUsernameField ? "error" : ""}
              id="username"
              type="text"
              @input=${this.onUsernameInput}
              @keydown=${this.checkEnterKey}
              placeholder="Inserisci il nome utente"
              title="Nome utente"
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

        <il-snackbar ${ref(this.snackbarRef)}></il-snackbar>
      </div>
    `;
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
        this.snackbarRef.value.openSnackbar(
          "CREDENZIALI NON VALIDE",
          "error",
          5000
        );
      });
  }
}

customElements.define("il-login", Login);
