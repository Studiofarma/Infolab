import { css, html } from "lit";
import { BaseComponent } from "../../components/base-component";

import { ThemeColorService } from "../../services/theme-color-service";

import { ThemeCSSVariables } from "../../enums/theme-css-variables";

import "../../components/horizontal-progress-bar";

export class Splash extends BaseComponent {
  static properties = {};

  constructor() {
    super();
  }

  static styles = css`
    * {
      ${ThemeColorService.getThemeVariables()};
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
      justify-content: center;
      border-radius: 10px;
      background-color: ${ThemeCSSVariables.loginBg};
      z-index: 2;
      overflow: hidden;
      color: #ffffff;
      margin-top: -15%;
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
}

customElements.define("il-splash", Splash);
