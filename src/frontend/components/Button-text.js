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
      padding: 8px 14px;
      border-radius: 30px;
      background: white;
      min-width: 80px;
      text-align: center;
      border: none;
      outline: none;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.3s ease-in-out;
    }

    .button-animate {
      animation: text-change-animation 0.5s ease-in-out;
    }

    @keyframes text-change-animation {
      0% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.2);
      }
      100% {
        transform: scale(1);
      }
    }
  `;

  render() {
    return html`
      <button @click="${this.change}" id="preview_btn">
        ${this.openPreview ? "Chiudi la Preview" : "Apri la Preview"}
      </button>
    `;
  }

  change() {
    this.openPreview = !this.openPreview;
    const button = this.shadowRoot.querySelector("#preview_btn");
    button.classList.add("button-animate");
    setTimeout(() => button.classList.remove("button-animate"), 500);
  }
}

customElements.define("il-button-text", ButtonText);
