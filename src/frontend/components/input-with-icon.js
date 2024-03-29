import { html, css } from "lit";
import { createRef, ref } from "lit/directives/ref.js";

import { ThemeColorService } from "../services/theme-color-service";

import { ThemeCSSVariables } from "../enums/theme-css-variables";

import { InputField } from "./input-field";

export class InputWithIcon extends InputField {
  static properties = {
    iconName: { type: String },
    iconTooltipText: { type: String },
  };

  constructor() {
    super();
    this.inputRef = createRef();
  }

  static styles = css`
    * {
      ${ThemeColorService.getThemeVariables()};
      box-sizing: border-box;
    }

    div {
      width: 100%;
      display: flex;
      border-radius: 10px;
      border: solid 2px;
      align-items: center;
      background-color: ${ThemeCSSVariables.inputBackground};
    }

    input {
      width: 100%;
      height: 40px;
      padding: 0 10px;
      border: none;
      outline: none;
      border-radius: 10px;
      color: ${ThemeCSSVariables.inputText};
      background-color: ${ThemeCSSVariables.inputBackground};
      position: relative;
      overflow: hidden;
    }

    input::placeholder {
      // importo anche qua il servizio per rendere visibili le variabili nello pseudo-elemento
      ${ThemeColorService.getThemeVariables()};
      color: ${ThemeCSSVariables.placeholder};
    }

    il-button-icon {
      padding: 5px;
    }

    div:has(input:focus) {
      border-color: ${ThemeCSSVariables.inputFocusedBorder};
    }

    div:not(:has(input:focus)) {
      border-color: ${ThemeCSSVariables.inputBorder};
    }
  `;

  render() {
    return html`
      <div>
        <input
          ${ref(this.inputRef)}
          placeholder="${this.placeholder}"
          @input=${this.setValue}
          value=${this.value}
        />

        <il-button-icon
          .content=${this.iconName}
          .tooltipText=${this.iconTooltipText}
          @click=${this.iconClick}
        ></il-button-icon>
      </div>
    `;
  }

  //#region Funzioni ereditate da Input-Field

  firstUpdated() {
    super.firstUpdated();
  }

  setValue(e) {
    super.setValue(e);
  }

  clear() {
    super.clear();
  }

  //#endregion

  //#region Getters & Setters

  getInputValue() {
    return this.inputRef.value.value;
  }

  setInputValue(text) {
    this.value = text;
    this.inputRef.value.value = text;
  }

  //#endregion

  focusInput() {
    this.inputRef.value?.focus();
  }

  selectInput() {
    this.inputRef.value?.select();
  }

  iconClick() {
    this.dispatchEvent(new CustomEvent("il:icon-clicked"));
  }
}

customElements.define("il-input-with-icon", InputWithIcon);
