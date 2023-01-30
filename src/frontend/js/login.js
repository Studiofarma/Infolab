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
      width: 400px;
      max-width: 100%;
      min-height: 300px;
      background: white;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      border-radius: 10px;
      background-color: #e4e8ee;
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

    div:has(#submit_btn) {
      display: flex;
      justify-content: flex-end;
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
        <h1 class="title">Come ti chiami?</h1>
        <div>
          <label>
            Username
            <div class="text-container">
              <input
                type="text"
                @input=${this.onUsernameInput}
                .value=${this.username}
                placeholder="Inserisci il nome utente"
              />
            </div>
          </label>
        </div>

        <div>
          <label>
            Password
            <div class="text-container">
              <input
                type=${this.pswVisibility ? "text" : "password"}
                @input=${this.onPasswordInput}
                .value=${this.password}
                placeholder="Inserisci la password"
              />
              <span @click=${this.setVisibility} class="material-icons">
                ${!this.pswVisibility ? "visibility" : "visibility_off"}
              </span>
            </div>
          </label>
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

  setVisibility() {
    this.pswVisibility = !this.pswVisibility;
  }

  loginConfirm() {
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
        console.log(e);
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
