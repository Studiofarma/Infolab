import { LitElement, html, css } from "lit";

import { IconNames } from "../enums/icon-names";
import { InputField } from "./input-field";

export class InputRicerca extends InputField {
  static styles = [
    css`
      * {
        width: 100%;
      }

      input {
        width: 100%;
        height: 40px;
        border-radius: 10px;
        padding: 0 10px;
        border: none;
        outline: none;
        color: white;
        background-color: rgb(0, 38, 78);
        position: relative;
        overflow: hidden;
      }
    `,
  ];

  render() {
    return html` <input
      placeholder="${this.placeholder}"
      @input="${this.search}"
    />`;
  }

  search(event) {
    this.dispatchEvent(
      new CustomEvent("search", {
        detail: {
          query: event.target.value,
        },
        bubbles: true,
        composed: true,
      })
    );
  }
}

customElements.define("il-input-ricerca", InputRicerca);
