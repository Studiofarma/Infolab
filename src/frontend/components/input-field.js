import { LitElement, html, css } from "lit";

import "./button-icon";

export class InputField extends LitElement {
  static get properties() {
    return {
      placeholder: "",
      type: "text",
      value: "",
    };
  }

  static styles = css`
    * {
      width: 100%;
    }

    #container {
      width: 100%;
    }

    #input {
      font: inherit;
      position: relative;
      width: 100%;
      height: 40px;
      padding: 5px 10px;
      border: none;
      outline: none;
      font-size: 15pt;
      transition: 0.5s;
      border-radius: 10px;
      box-shadow: 0 0 10px #333333;
    }
  `;

  render() {
    return html`
      <div id="container">
        <input
          placeholder="${this.placeholder}"
          type="${this.type}"
          id="input"
          value="${this.value}"
        />
      </div>
    `;
  }
}

customElements.define("il-input-field", InputField);
