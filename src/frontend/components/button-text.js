import { LitElement, html, css } from "lit";

import { ThemeColorService } from "../services/theme-color-service";

import { ThemeCSSVariables } from "../enums/theme-css-variables";

export class ButtonText extends LitElement {
  static get properties() {
    return {
      text: { type: String },
      isActive: { type: Boolean },
      color: { type: String },
    };
  }

  static styles = css`
    * {
      ${ThemeColorService.getThemeVariables()};
    }

    button {
      padding: 0px 24px;
      font-family: inherit;
      border-radius: 10px;
      text-align: center;
      border: 1px solid ${ThemeCSSVariables.buttonBorder};
      color: ${ThemeCSSVariables.buttonText};
      height: 40px;
      cursor: pointer;
    }
  `;

  render() {
    return html`
      <button
        style=${this.color
          ? `background: ${this.color}`
          : `background: ${ThemeCSSVariables.buttonConfirmBg};`}
      >
        ${this.text}
      </button>
    `;
  }
}

customElements.define("il-button-text", ButtonText);
