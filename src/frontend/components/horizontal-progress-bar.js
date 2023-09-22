import { css, html } from "lit";
import { BaseComponent } from "./base-component";

import { ThemeColorService } from "../services/theme-color-service";

import { ThemeCSSVariables } from "../enums/theme-css-variables";

export class HorizontalProgressBar extends BaseComponent {
  static properties = {};

  constructor() {
    super();
  }

  static styles = css`
    * {
      ${ThemeColorService.getThemeVariables()};
    }

    body {
      margin: 0;
      padding: 25px;
    }

    .progress-bar-container {
      width: 300px;
      margin: auto;
    }

    .progress-bar {
      height: 5px;
      background-color: rgba(255, 255, 255, 0.2);
      width: 100%;
      overflow: hidden;
    }

    .progress-bar-value {
      all: revert;
      width: 100%;
      height: 100%;
      background-color: white;
      opacity: revert;
      animation: indeterminateAnimation 1s infinite linear;
      transform-origin: 0% 50%;
    }

    @keyframes indeterminateAnimation {
      0% {
        transform: translateX(0) scaleX(0);
      }
      40% {
        transform: translateX(0) scaleX(0.4);
      }
      100% {
        transform: translateX(100%) scaleX(0.5);
      }
    }
  `;

  render() {
    return html`
      <div class="progress-bar-container">
        <div class="progress-bar">
          <div class="progress-bar-value"></div>
        </div>
      </div>
    `;
  }
}

customElements.define("il-horizontal-progress-bar", HorizontalProgressBar);
