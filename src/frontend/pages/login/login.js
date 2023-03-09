import { LitElement, html, css } from "lit";
const axios = require("axios").default;

import "../../components/snackbar";
import "../../components/button-icon";
import "../../components/input-field";

export class Login extends LitElement {
  static properties = {
    username: "",
    password: "",
    pswVisibility: false,
    emptyUsernameField: true,
    emptyPasswordField: true,
    psw: "",
    user: "",
  };

  constructor() {
    super();
    this.username = "";
    this.password = "";
    this.pswVisibility = false;
    this.emptyUsernameField = true;
    this.emptyPasswordField = true;
    this.psw = document.getElementById("password");
    this.user = document.getElementById("username");
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

    label {
      text-align: center;
      width: 100%;
      display: block;
      margin-bottom: 10px;
    }

    #input-container {
      text-align: center;
    }
  `;

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
              @keydown=${this.checkEnterKey}
              placeholder="Inserisci lo username"
              title="Username"
            ></il-input-field>
          </div>

          <label> Password </label>
          <div class="text-container">
            <il-input-field
              class=${this.emptyPasswordField ? "error" : ""}
              id="password"
              type=${this.pswVisibility ? "text" : "password"}
              @keydown=${this.checkEnterKey}
              placeholder="Inserisci la password"
            ></il-input-field>

            <il-button-icon
              @click=${this.setVisibility}
              content="${!this.pswVisibility ? "mdiEye" : "mdiEyeOff"}"
            ></il-button-icon>
          </div>

          <div>
            <button id="submit_btn" @click=${this.loginConfirm}>
              Connetti
            </button>
          </div>
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

  checkEnterKey(e) {
    if (e.key === "Enter") this.loginConfirm();
  }

  setVisibility() {
    this.pswVisibility = !this.pswVisibility;
  }

  loginConfirm() {
    let psw = this.renderRoot.querySelector("div  il-input-field#password");
    let user = this.renderRoot.querySelector("div  il-input-field#username");
    this.password = psw.value;
    this.username = user.value;

    console.log(this.password, this.username);
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
        this.dispatchEvent(
          new CustomEvent("login-confirm", {
            detail: {
              login: {
                username: this.username,
                password: this.password,
                headerName: response.data.headerName,
                token: response.data.token,
              },
            },
          })
        );
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
