import { html, css } from "lit";
import { createRef, ref } from "lit/directives/ref.js";

import { LoginService } from "../../services/login-service";
import { CookieService } from "../../services/cookie-service";
import { ThemeColorService } from "../../services/theme-color-service";

import { ThemeCSSVariables } from "../../enums/theme-css-variables";

import "../../components/snackbar";
import "../../components/button-icon";
import "../../components/button-text";
import "../../components/input-field";
import "../../components/input-password";

import { BaseComponent } from "../../components/base-component";
import { StorageService } from "../../services/storage-service";

export class Login extends BaseComponent {
  static properties = {
    username: "",
    password: "",
    isPasswordVisible: false,
    isUsernameFieldEmpty: false,
    isPasswordFieldEmpty: false,
    header: "",
    token: "",
    cookie: { type: Object },
    jwt: { type: String },
  };

  constructor() {
    super();
    this.isPasswordVisible = false;
    this.isUsernameFieldEmpty = false;
    this.isPasswordFieldEmpty = false;
    this.header = "";
    this.token = "";

    const params = new URL(window.location.href).searchParams;
    this.jwt = params.get("access_token");
    if (this.jwt) this.loginConfirm();

    this.username = StorageService.getItemByKey(StorageService.Keys.username);
    this.password = StorageService.getItemByKey(StorageService.Keys.password);
    if (this.username && this.password) this.loginConfirm();

    // Refs
    this.snackbarRef = createRef();
  }

  static styles = css`
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      ${ThemeColorService.getThemeVariables()};
      color: ${ThemeCSSVariables.text};
    }

    #background {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: ${ThemeCSSVariables.loginBg};
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
      background-color: ${ThemeCSSVariables.loginFieldBg};
      z-index: 2;
      overflow: hidden;
    }

    div[class^="ring"] {
      position: absolute;
      background-color: ${ThemeCSSVariables.loginBg};
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
      background: ${ThemeCSSVariables.loginFieldBg};
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
      color: ${ThemeCSSVariables.iconColor};
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

  setCookieWithCurrentData() {
    StorageService.setItemByKey(StorageService.Keys.username, this.username);
    StorageService.setItemByKey(StorageService.Keys.password, this.password);
    StorageService.setItemByKey(StorageService.Keys.csrfHeader, this.header);
    StorageService.setItemByKey(StorageService.Keys.csrfToken, this.token);
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
              class=${this.isUsernameFieldEmpty ? "error" : ""}
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
              class=${this.isPasswordFieldEmpty ? "error" : ""}
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
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  loginConfirmEvent() {
    this.dispatchEvent(
      new CustomEvent("il:login-confirmed", {
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
    if (this.jwt) {
      LoginService.getLoginWithToken(this.jwt).then((response) => {
        this.loginConfirmEvent();
      });
      return;
    }

    if (this.username === "" && this.password === "") {
      this.isUsernameFieldEmpty = true;
      this.isPasswordFieldEmpty = true;
      return;
    }

    if (this.username === "") {
      this.isUsernameFieldEmpty = true;
      return;
    }

    if (this.password === "") {
      this.isPasswordFieldEmpty = true;
      return;
    }

    LoginService.getLogin(this.username, this.password)
      .then((response) => {
        this.header = response.data.headerName;
        this.token = response.data.token;
        this.setCookieWithCurrentData();
        this.loginConfirmEvent();
      })
      .catch(() => {
        this.isUsernameFieldEmpty = false;
        this.isPasswordFieldEmpty = false;
        this.snackbarRef.value.openSnackbar(
          "CREDENZIALI NON VALIDE",
          "error",
          5000
        );
      });
  }
}

customElements.define("il-login", Login);
