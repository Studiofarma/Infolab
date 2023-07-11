import { LitElement, html, css } from "lit";

import { ThemeColorService } from "../services/theme-color-service";

const layoutID = "buttonText";
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
      ${ThemeColorService.applyStyle(layoutID)};
    }

    button {
      padding: 0px 24px;
      font-family: inherit;
      border-radius: 10px;
      text-align: center;
      border: 1px solid var(--buttonBorder);
      color: var(--buttonText);
      height: 40px;
      cursor: pointer;
    }
  `;

  render() {
    return html`
      <button
        style=${this.color
          ? `background: ${this.color}`
          : "background: var(--buttonConfirmBg);"}
      >
        ${this.text}
      </button>
    `;
  }
}

customElements.define("il-button-text", ButtonText);
