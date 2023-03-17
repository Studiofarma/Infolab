import { LitElement, html, css } from "lit";

export class ButtonText extends LitElement {
  static properties = {
    text: "",
  };

  static styles = css`
    button {
      padding: 0px 24px;
      font-family: inherit;
      border-radius: 30px;
      background: #00234f;
      text-align: center;
      font-weight: bold;
      color: white;
      height: 40px;
      margin: 8px;
    }
  `;

  render() {
    return html` <button>${this.text}</button> `;
  }
}

customElements.define("il-button-text", ButtonText);
