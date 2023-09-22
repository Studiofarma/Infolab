import { LitElement, html } from "lit";
import { when } from "lit/directives/when.js";
import "./login/login.js";
import "./chat/chat.js";
import { CommandsService } from "../services/commands-service.js";
export class App extends LitElement {
  static properties = {
    isLoggedIn: { Boolean },
  };

  constructor() {
    super();
    this.isLoggedIn = false;
  }

  render() {
    return html`
      ${when(
        !this.isLoggedIn,
        () =>
          when(
            CommandsService.isDevOrTest(),
            () => html`
              <il-login @il:login-confirmed="${this.loginConfirm}"></il-login>
            `,
            () => html`<il-splash></il-splash>`
          ),
        () => html` <il-chat></il-chat> `
      )}
    `;
  }

  loginConfirm(e) {
    this.isLoggedIn = true;
  }
}

customElements.define("il-app", App);
