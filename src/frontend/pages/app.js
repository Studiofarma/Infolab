import { LitElement, html } from "lit";
import { when } from "lit/directives/when.js";

import { CommandsService } from "../services/commands-service.js";

import "./login/login.js";
import "./login/splash.js";
import "./login/login-error.js";
import "./chat/chat.js";
export class App extends LitElement {
  static properties = {
    isLoggedIn: { Boolean },
    isLoginFailed: { Boolean },
  };

  constructor() {
    super();
    this.isLoggedIn = false;
    this.isLoginFailed = false;
  }

  render() {
    return html`
      ${when(
        !this.isLoggedIn,
        () =>
          when(
            CommandsService.isDevOrTest(),
            () => html`
              <il-login @il:login-confirmed=${this.loginConfirm}></il-login>
            `,
            () =>
              when(
                !this.isLoginFailed,
                () => html`
                  <il-splash
                    @il:login-confirmed="${this.loginConfirm}"
                    @il:login-failed=${this.loginFail}
                  ></il-splash>
                `,
                () => html`<il-login-error></il-login-error>`
              )
          ),
        () => html` <il-chat></il-chat> `
      )}
    `;
  }

  loginConfirm() {
    this.isLoggedIn = true;
  }

  loginFail() {
    this.isLoginFailed = true;
  }
}

customElements.define("il-app", App);
