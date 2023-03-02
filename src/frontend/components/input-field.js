import { LitElement, html, css } from "lit";

import "./button-icon";

export class InputField extends LitElement {
  static get properties() {
    return {
      placeholder: "",
      type: "text",
      value: "",
      title: "",
    };
  }
  constructor() {
    super();
    this.value = "";
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
      border: solid 1px;
      outline: none;
      font-size: 15pt;
      transition: 0.5s;
      border-radius: 10px;
    }
  `;

  render() {
    return html`
      <div id="container">
        <label>${this.title}</label>
        <input
          placeholder="${this.placeholder}"
          type="${this.type}"
          id="input"
          value="${this.value}"
          @input=${this.setValue}
        />
      </div>
    `;
  }

  setValue(e) {
    this.value = e.target.value;
  }
}

customElements.define("il-input-field", InputField);
