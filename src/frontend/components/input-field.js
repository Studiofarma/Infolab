import { LitElement, html, css } from "lit";

import "./button-icon";

export class InputField extends LitElement {
  static get properties() {
    return {
      placeholder: "",
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
      border: solid 2px #5a9bfb;
      outline: none;
      font-size: 15pt;
      transition: 0.5s;
      border-radius: 10px;
    }
  `;

  render() {
    return html`
      ${this.title === "" ? html`` : html`<label>${this.title}</label>`}
      <input
        placeholder="${this.placeholder}"
        id="input"
        @input=${this.setValue}
        @blur="${this.setBlur}"
        @focus="${this.setFocus}"
      />
    `;
  }

  setValue(e) {
    this.value = e.target.value;
  }

  setFocus() {
    this.renderRoot.querySelector("input").style.border = "solid 2px #009C3E";
  }

  setBlur() {
    this.renderRoot.querySelector("input").style.border = "solid 2px #5A9BFB";
  }
}

customElements.define("il-input-field", InputField);
