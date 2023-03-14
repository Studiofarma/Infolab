import { LitElement, html, css } from "lit";

export class ButtonText extends LitElement {
  static properties = {
    openPreview: { type: Boolean },
  };

  constructor() {
    super();
    this.openPreview = false;
  }

  static styles = css`
    #preview_btn {
      margin-left: auto;
      padding: 7px 12px;
      border-radius: 45px;
      background: white;
      min-width: 80px;
      text-align: center;
      border: none;
      outline: none;
      font-weight: bold;
      cursor: pointer;
    }
  `;

  render() {
    return html`
      <button @click="${this.change}" id="preview_btn">
        ${this.openPreview ? "Chiudi la Preview" : "Apri preview"}
      </button>
    `;
  }

  change() {
    this.openPreview = !this.openPreview;
  }
}

customElements.define("il-button-text", ButtonText);
