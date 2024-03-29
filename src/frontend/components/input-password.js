import { html, css } from "lit";
import { when } from "lit/directives/when.js";

import { IconNames } from "../enums/icon-names";
import { InputField } from "./input-field";

export class InputPassword extends InputField {
  static get properties() {
    return {
      isPasswordVisible: false,
      placeholder: "",
      value: "",
      title: "",
    };
  }

  constructor() {
    super();
    this.value = "";
  }

  static styles = [
    InputField.styles,
    css`
      ::-ms-reveal {
        display: none;
      }

      div {
        height: 54px;
      }

      il-button-icon {
        opacity: 0;
        display: block;
        width: 35px;
        position: relative;
        bottom: 45px;
        left: 355px;
      }

      il-button-icon:hover {
        opacity: 1;
      }
    `,
  ];

  render() {
    return html`
      ${when(
        this.title === "",
        () => html``,
        () => html`<label>${this.title}</label>`
      )}
      <div>
        <input
          placeholder="${this.placeholder}"
          id="input"
          @input=${this.setValue}
          @blur="${this.setBlur}"
          @focus="${this.setFocus}"
          type=${!this.isPasswordVisible ? "password" : "text"}
        />

        <il-button-icon
          @click=${this.toggleVisibility}
          content="${!this.isPasswordVisible
            ? IconNames.eye
            : IconNames.eyeOff}"
        ></il-button-icon>
      </div>
    `;
  }

  toggleVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }
}

customElements.define("il-input-password", InputPassword);
