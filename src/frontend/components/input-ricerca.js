import { LitElement, html, css } from "lit";

import { IconNames } from "../enums/icon-names";
import { InputField } from "./input-field";
import { ButtonIcon } from "./button-icon";

export class InputRicerca extends InputField {
  static properties = {
    isFocus: { type: Boolean },
  };

  constructor() {
    super();
    this.isFocus = false;
  }

  static styles = [
    css`
      div {
        width: 100%;
        display: flex;
        background-color: rgb(0, 38, 78);
        border-radius: 10px;
        color: white;
      }

      input {
        width: 100%;
        height: 40px;
        padding: 0 10px;
        border: none;
        outline: none;
        color: white;
        background-color: rgba(0, 0, 0, 0);
        position: relative;
        overflow: hidden;
      }

      il-button-icon {
        padding: 5px;
      }
    `,
  ];

  render() {
    return html`
      <div>
        <input
          placeholder="${this.placeholder}"
          @input="${() => {
            this.search();
            this.setValue();
          }}"
          @focus="${this.toggleFocus}"
          @blur=${this.toggleFocus}
        />
        <il-button-icon
          @click=${() => {
            this.clear();
            this.search();
          }}
          content=${this.isFocus == true ? IconNames.close : IconNames.magnify}
        ></il-button-icon>
      </div>
    `;
  }

  search(event) {
    let input = this.renderRoot.querySelector("div input");
    this.dispatchEvent(
      new CustomEvent("search", {
        detail: {
          query: input.value,
        },
        bubbles: true,
        composed: true,
      })
    );
    input.focus();
  }

  toggleFocus() {
    this.isFocus = !this.isFocus;
  }
}

customElements.define("il-input-ricerca", InputRicerca);
