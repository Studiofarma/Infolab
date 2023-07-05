import { LitElement, html, css } from "lit";

export class ButtonText extends LitElement {
  static get properties() {
    return {
      text: { type: String },
      isActive: { type: Boolean },
      color: { type: String },
    };
  }

  static styles = css`
    button {
      padding: 0px 24px;
      font-family: inherit;
      border-radius: 10px;
      text-align: center;
      border: 1px solid #616870;
      color: white;
      height: 40px;
      cursor: pointer;
    }
  `;

  render() {
    return html`
      <button
        style=${this.color
          ? `background: ${this.color}`
          : "background: #206cf7;"}
      >
        ${this.text}
      </button>
    `;
  }
}

customElements.define("il-button-text", ButtonText);
