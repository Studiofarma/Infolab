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
      border: solid 2px #989a9d;
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
          @input=${this.setValue}
          @blur="${this.setBlur}"
          @focus="${this.setFocus}"
        />
      </div>
    `;
  }

  setValue(e) {
    this.renderRoot.value = e.target.value;
  }

  setFocus() {
    this.renderRoot.querySelector("input").style.border = "solid 2px #1D1E20";
  }

  setBlur() {
    this.renderRoot.querySelector("input").style.border = "solid 2px #989A9D";
  }
}

customElements.define("il-input-field", InputField);
