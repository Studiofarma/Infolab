import { LitElement, html, css } from "lit";

import { IconNames } from "../enums/icon-names";
import { InputField } from "./input-field";
import { Icon } from "./icon";

export class InputRicerca extends InputField {
  static styles = [
    css`
      div {
        width: 100%;
        display: flex;
        background-color: rgb(0, 38, 78);
        border-radius: 10px;
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

      il-icon {
        padding: 5px;
      }
    `,
  ];

  render() {
    return html`
      <div>
        <input placeholder="${this.placeholder}" @input="${this.search}" />
        <il-icon name=${IconNames.magnify}></il-icon>
      </div>
    `;
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
