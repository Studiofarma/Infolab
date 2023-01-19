import { LitElement, html } from "lit";
const axios = require("axios").default;

export class Login extends LitElement {
  static properties = {
    username: "",
    password: "",
  };

  constructor() {
    super();
    this.username = "user1";
    this.password = "password1";
  }

  render() {
    return html`
      <h1 class="title">Come ti chiami?</h1>
      <div>
        <label>
          Username:
          <input
            type="text"
            @input=${this.onUsernameInput}
            .value=${this.username}
          />
        </label>
        <br />
        <label>
          Password:
          <input
            type="password"
            @input=${this.onPasswordInput}
            .value=${this.password}
          />
        </label>
      </div>
      <br />
      <div>
        <button @click=${this.loginConfirm}>Connetti</button>
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
