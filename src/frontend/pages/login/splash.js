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
}

customElements.define("il-splash", Splash);
