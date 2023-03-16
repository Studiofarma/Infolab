import { LitElement, html, css } from "lit";

export class ButtonText extends LitElement {
  static properties = {
    text: "",
  };

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
  `;

  render() {
    return html` <button id="preview_btn">${this.text}</button> `;
  }
}

customElements.define("il-button-text", ButtonText);
