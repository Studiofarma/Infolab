import { LitElement, html, css } from "lit";
const axios = require("axios").default;

export class Login extends LitElement {
  static properties = {
    username: "",
    password: "",
    pswVisibility: {},
  };

  constructor() {
    super();
    this.username = "user1";
    this.password = "password1";
    this.pswVisibility = false;
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
      background: #013365;
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

    .text-container span {
      position: absolute;
      transform: translateY(50%);
      bottom: 20px;
      right: 10px;
      z-index: 2;
      color: rgba(10, 10, 128, 0.829);
      opacity: 0;
      transition: 0.5s;
    }

    .text-container:hover span {
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
      width: 100%;
      margin-top: 30px;
    }

    * {
      font-family: inherit;
    }

    .material-icons {
      font-family: "Material Icons";
      font-weight: normal;
      font-style: normal;
      font-size: 24px;
      line-height: 1;
      letter-spacing: normal;
      text-transform: none;
      display: inline-block;
      white-space: nowrap;
      word-wrap: normal;
      direction: ltr;
      -webkit-font-smoothing: antialiased;
      cursor: pointer;
    }
  `;

  render() {
    return html`
      <div id="container">
        <div class="ring1"></div>
        <div class="ring2"></div>
        <h1 class="title">Welcome Back</h1>
        <div>
          <label>
            Username
            <div class="text-container">
              <input
                id="username"
                type="text"
                @input=${this.onUsernameInput}
                @keydown=${this.checkLogin}
                .value=${this.username}
                placeholder="Inserisci il nome utente"
              />
            </div>
          </label>
          <label id="usernameError"></label>
        </div>

        <div>
          <label>
            Password
            <div class="text-container">
              <input
                id="password"
                type=${this.pswVisibility ? "text" : "password"}
                @input=${this.onPasswordInput}
                @keydown=${this.checkLogin}
                .value=${this.password}
                placeholder="Inserisci la password"
              />
              <span @click=${this.setVisibility} class="material-icons">
                ${!this.pswVisibility ? "visibility" : "visibility_off"}
              </span>
            </div>
          </label>
          <label id="passwordError"></label>
          <label id="accessError" style="text-align: center;"></label>
        </div>
        <div>
          <button id="submit_btn" @click=${this.loginConfirm}>Connetti</button>
        </div>
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

  checkLogin(e) {
    if (e.key == "Enter") this.loginConfirm();
  }

  setVisibility() {
    this.pswVisibility = !this.pswVisibility;
  }

  getElement(query) {
    return this.renderRoot.querySelector(query) ?? null;
  }

  loginConfirm() {
    if (
      this.getElement("#username").value === "" &&
      this.getElement("#password").value === ""
    ) {
      this.getElement("#usernameError").innerText = "*Inserisci uno username";
      this.getElement("#passwordError").innerText = "*Inserisci una password";
      return;
    }

    if (this.getElement("#username").value === "") {
      this.getElement("#usernameError").innerText = "*Inserisci uno username";
      return;
    }

    if (this.getElement("#password").value === "") {
      this.getElement("#passwordError").innerText = "*Inserisci una password";
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
        this.getElement("#accessError").innerText = "*CREDENZIALI NON VALIDE";
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
