import { LitElement, html } from "lit";
import { when } from "lit/directives/when.js";
import "./login/login.js";
import "./chat/chat.js";
export class App extends LitElement {
  static get properties() {
    return {
      login: {
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
      username: "",
      password: "",
      headerName: "",
      token: "",
    };
  }

  render() {
    return html`
      ${when(
        this.login.username === "",
        () => html`
          <il-login @il:login-confirmed="${this.loginConfirm}"></il-login>
        `,
        () => html` <il-chat></il-chat> `
      )}
    `;
  }

  loginConfirm(e) {
    this.login = e.detail.login;
  }
}

customElements.define("il-app", App);
