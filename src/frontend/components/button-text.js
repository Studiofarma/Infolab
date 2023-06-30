import { LitElement, html, css } from "lit";

export class ButtonText extends LitElement {
  static get properties() {
    return {
      text: { type: String },
      isActive: { type: Boolean },
      isDisadled: false,
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
      color: white;
      height: 40px;
      cursor: pointer;
    }

    .inactive {
      background-color: #dbdde0;
      color: black;
    }
  `;

  render() {
    return html`
      <button class="${this.isActive ? "" : "inactive"}">${this.text}</button>
    `;
  }
}

customElements.define("il-button-text", ButtonText);
