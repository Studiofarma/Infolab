import { LitElement, html, css } from "lit";

export class ButtonText extends LitElement {
  static get properties() {
    return {
      text: { type: String },
      isActive: { type: Boolean },
    };
  }

  static styles = css`
    button {
      padding: 0px 24px;
      font-family: inherit;
      border-radius: 10px;
      background: #206cf7;
      text-align: center;
      border: 1px solid #616870;
      border-bottom: 0;
      color: white;
      height: 40px;
      cursor: pointer;
    }

    .active {
      border: 1px solid transparent;
      background: none;
      transform: translateY(1px);
    }
  `;

  render() {
    return html`
      <button class="${this.isActive ? "active" : ""}">${this.text}</button>
    `;
  }
}

customElements.define("il-button-text", ButtonText);
