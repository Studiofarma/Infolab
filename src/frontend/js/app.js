import { LitElement, html } from "lit";
import "./login.js";
import "./chat.js";

export class App extends LitElement {
  static get properties() {
    return {
      login: {
        ok: false,
        username: "",
        password: "",
        headerName: "",
        token: "",
      },
    };
  }

  constructor() {
    super();
    this.login = {
      ok: false,
      username: "",
      password: "",
      headerName: "",
      token: "",
    };
  }

  render() {
    return html`
      ${this.login.username == ""
        ? html` <il-login @login-confirm="${this.loginConfirm}"></il-login> `
        : html` <il-chat .login=${this.login}></il-chat> `}
    `;
  }

  loginConfirm(e) {
    this.login = e.detail.login;
  }
}

customElements.define("il-app", App);
