import { LitElement, html, css, adoptStyles } from "lit";
import { createRef, ref } from "lit/directives/ref.js";
import { when } from "lit/directives/when.js";

import { ThemeColorService } from "../services/theme-color-service";

import { ThemeCSSVariables } from "../enums/theme-css-variables";

import "./button-icon";

import { ElementMixin } from "../models/element-mixin";

export class InputField extends ElementMixin(LitElement) {
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
      color: ${ThemeCSSVariables.inputText};
      background-color: ${ThemeCSSVariables.inputBackground};
      border: none;
      outline: none;
      font-size: 15pt;
      transition: 0.5s;
      border-radius: 10px;
    }

    input::placeholder {
      // importo anche qua il servizio per rendere visibili le variabili nello pseudo-elemento
      ${ThemeColorService.getThemeVariables()};
      color: ${ThemeCSSVariables.placeholder};
    }
  `;

  render() {
    return html`
      ${when(
        this.title === "",
        () => html``,
        () => html`<label>${this.title}</label>`
      )}
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
  }

  clear() {
    this.inputRef.value.value = "";
    this.value = "";
  }
}

customElements.define("il-input-field", InputField);
