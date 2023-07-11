import { html, css } from "lit";
import { createRef, ref } from "lit/directives/ref.js";

import { ThemeColorService } from "../services/theme-color-service";

import { InputField } from "./input-field";

export class InputWithIcon extends InputField {
  static properties = {
    isFocus: { type: Boolean },
    iconName: { type: String },
    iconTooltipText: { type: String },
  };

  constructor() {
    super();
    this.isFocus = false;
    this.inputRef = createRef();
  }

  static styles = css`
    * {
      ${ThemeColorService.applyStyle()};
    }

    div {
      width: 100%;
      display: flex;
      color: white;
      border-radius: 10px;
      border: solid 2px;
      align-items: center;
    }

    input {
      width: 100%;
      height: 40px;
      padding: 0 10px;
      border: none;
      outline: none;
      background-color: var(--inputBackground);
      position: relative;
      overflow: hidden;
    }

    il-button-icon {
      padding: 5px;
    }

    div:has(input:focus) {
      border-color: var(--inputFocusedBorder);
    }

    div:not(:has(input:focus)) {
      border-color: var(--inputBorder);
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

  // Funzioni ereditate da Input-Field

  firstUpdated() {
    super.firstUpdated();
  }

  setValue(e) {
    super.setValue(e);
  }

  clear() {
    super.clear();
  }

  // ----------------------

  // Getters & Setters

  getInputValue() {
    return this.inputRef.value.value;
  }

  setInputValue(text) {
    this.value = text;
    this.inputRef.value.value = text;
  }

  // ------------------------

  focusInput() {
    this.inputRef.value?.focus();
  }

  selectInput() {
    this.inputRef.value?.select();
  }

  iconClick() {
    this.dispatchEvent(new CustomEvent("icon-click"));
  }
}

customElements.define("il-input-with-icon", InputWithIcon);
