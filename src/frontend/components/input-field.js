import { LitElement, html, css } from "lit";
import { createRef, ref } from "lit/directives/ref.js";

import { ThemeColorService } from "../services/theme-color-service";

import { VariableNames } from "../enums/theme-colors";

import "./button-icon";

export class InputField extends LitElement {
  static get properties() {
    return {
      placeholder: "",
      value: "",
      title: "",
      selectionStart: "",
      selectionEnd: "",
    };
  }

  constructor() {
    super();
    this.value = "";

    // Refs
    this.inputRef = createRef();
  }

  static styles = css`
    * {
      width: 100%;
      ${ThemeColorService.getThemeVariables()};
    }

    input {
      font: inherit;
      position: relative;
      width: 100%;
      height: 40px;
      padding: 5px 10px;
      color: ${VariableNames.inputText};
      border: none;
      outline: none;
      font-size: 15pt;
      transition: 0.5s;
      border-radius: 10px;
    }

    input::placeholder {
      // importo anche qua il servizio per rendere visibili le variabili nello pseudo-elemento
      ${ThemeColorService.getThemeVariables()};
      color: ${VariableNames.placeholder};
    }
  `;

  render() {
    return html`
      ${this.title === "" ? html`` : html`<label>${this.title}</label>`}
      <input
        ${ref(this.inputRef)}
        id="message-input"
        placeholder="${this.placeholder}"
        @input=${this.setValue}
        .value=${this.value}
      />
    `;
  }

  firstUpdated() {
    this.inputRef.value?.focus();
  }

  setValue(e) {
    this.value = e.target.value;
    this.selectionStart = e.target.selectionStart;
    this.selectionEnd = e.target.selectionEnd;
  }

  clear() {
    this.inputRef.value.value = "";
    this.value = "";
  }
}

customElements.define("il-input-field", InputField);
