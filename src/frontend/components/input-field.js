import { LitElement, html, css, adoptStyles } from "lit";
import { createRef, ref } from "lit/directives/ref.js";
import { when } from "lit/directives/when.js";

import { ThemeColorService } from "../services/theme-color-service";

import { ThemeCSSVariables } from "../enums/theme-css-variables";

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

  connectedCallback() {
    super.connectedCallback();

    document.addEventListener("change-theme", () => {
      // changing the adoptedStylesheet
      let stylesheet = this.shadowRoot.adoptedStyleSheets[0];
      let rules = stylesheet.cssRules;

      let index = Object.values(rules).findIndex(
        (rule) => rule.selectorText === "*"
      );

      let newSelectorText = `
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    ${ThemeColorService.getThemeVariables().toString()};
  }`;

      stylesheet.deleteRule(index);
      stylesheet.insertRule(newSelectorText, index);

      adoptStyles(this.shadowRoot, [stylesheet]);
    });
  }

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
