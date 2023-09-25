import { css, html } from "lit";
import { BaseComponent } from "../../components/base-component";

import { ThemeColorService } from "../../services/theme-color-service";
import { LoginService } from "../../services/login-service";
import { StorageService } from "../../services/storage-service";

import { ThemeCSSVariables } from "../../enums/theme-css-variables";

import "../../components/horizontal-progress-bar";

export class Splash extends BaseComponent {
  static properties = {};

  constructor() {
    super();
  }

  async connectedCallback() {
    super.connectedCallback();

    if (await this.isJwtAvailable(0)) {
      this.loginConfirmWithJwt();
    } else {
      this.dispatchEvent(new CustomEvent("il:login-failed"));
    }
  }

  static styles = css`
    * {
      ${ThemeColorService.getThemeVariables()};
      color: ${ThemeCSSVariables.splashText};
    }

    #background {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: ${ThemeCSSVariables.splashBg};
      z-index: 1;
    }

    #container {
      position: relative;
      padding: 1.5rem 2rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border-radius: 10px;
      background-color: ${ThemeCSSVariables.splashBg};
      z-index: 2;
      overflow: hidden;
      margin-top: -20%;
    }
  `;

  render() {
    return html`
      <div id="background"></div>
      <div id="container">
        <h1>Application Name</h1>
        <il-horizontal-progress-bar></il-horizontal-progress-bar>
      </div>
    `;
  }

  async isJwtAvailable(counter) {
    try {
      if (MY_JWT) {
        return MY_JWT;
      }
    } catch (e) {
      await new Promise((r) => setTimeout(r, 100));

      if (counter < 50) {
        counter++;
        return await this.isJwtAvailable(counter);
      } else {
        return false;
      }
    }
  }

  loginConfirmWithJwt() {
    LoginService.getLogin().then((response) => {
      this.csrfToken = response.data.token;
      this.storeCsrfToken();
      this.loginConfirmEvent();
    });
  }

  storeCsrfToken() {
    StorageService.setItemByKeySession(
      StorageService.Keys.csrfToken,
      this.csrfToken
    );
  }

  loginConfirmEvent() {
    this.dispatchEvent(new CustomEvent("il:login-confirmed"));
  }
}

customElements.define("il-splash", Splash);
