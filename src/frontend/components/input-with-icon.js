import { html, css } from "lit";
import { createRef, ref } from "lit/directives/ref.js";

import { ThemeColorService } from "../services/theme-color-service";

import { InputField } from "./input-field";

const layoutID = "inputWithIcon";
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
      ${ThemeColorService.applyStyle(layoutID)};
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

    .visible {
      visibility: visible;
    }

    .hidden {
      visibility: hidden;
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

  focusInput() {
    this.inputRef.value?.focus();
  }

  selectInput() {
    this.inputRef.value?.select();
  }

  iconClick() {
    this.dispatchEvent(new CustomEvent("icon-click"));
  }

  setInputValue(text) {
    this.value = text;
    this.inputRef.value.value = text;
  }

  getInputValue() {
    return this.inputRef.value.value;
  }
}

customElements.define("il-input-with-icon", InputWithIcon);
