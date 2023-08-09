import { html, css, LitElement } from "lit";
import { ThemeColorService } from "../services/theme-color-service";
import { ThemeCSSVariables } from "../enums/theme-css-variables";

class CircularProgressBar extends LitElement {
  static styles = css`
    .circular-progress {
      ${ThemeColorService.getThemeVariables()};
      position: relative;
      height: 60px;
      width: 60px;
      border-radius: 50%;
      background: conic-gradient(
        ${ThemeCSSVariables.circularProgressBarProgress} 120deg,
        ${ThemeCSSVariables.circularProgressBarBackground} 0deg
      );
      display: flex;
      align-items: center;
      justify-content: center;
      animation-name: rotate;
      animation-duration: 0.8s;
      animation-iteration-count: infinite;
      animation-timing-function: cubic-bezier(0.66, 0.34, 0.34, 0.66);
    }
    .circular-progress::before {
      content: "";
      position: absolute;
      height: 50px;
      width: 50px;
      border-radius: 50%;
      background-color: ${ThemeCSSVariables.circularProgressBarBackground};
    }

    @keyframes rotate {
      from {
        transform: rotate(-60deg);
      }
      to {
        transform: rotate(300deg);
      }
    }
  `;

  render() {
    return html`
      <div class="circular-progress">
        <span class="center"></span>
      </div>
    `;
  }
}

customElements.define("il-circular-progress-bar", CircularProgressBar);
