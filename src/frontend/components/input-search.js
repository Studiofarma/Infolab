import { html, css } from "lit";

import { IconNames } from "../enums/icon-names";
import { TooltipTexts } from "../enums/tooltip-texts";

import { InputField } from "./input-field";

import "./button-icon";
import "../components/tooltip";
import "./button-icon-with-tooltip";

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
        color: white;
        border-radius: 10px;
        border: solid 2px;
      }

      .focused {
        border-color: #206cf7;
      }

      .blurred {
        border-color: #989a9d;
      }

      input {
        width: 100%;
        height: 40px;
        padding: 0 10px;
        border: none;
        outline: none;
        background-color: rgba(0, 0, 0, 0);
        position: relative;
        overflow: hidden;
      }

      il-button-icon-with-tooltip {
        padding: 5px;
      }

      .visible {
        visibility: visible;
      }

      .hidden {
        visibility: hidden;
      }
    `,
  ];

  render() {
    return html`
      <div class=${this.isFocus ? "focused" : "blurred"}>
        <input
          placeholder="${this.placeholder}"
          @input="${(e) => {
            this.search();
            this.setValue(e);
          }}"
          @focus="${this.toggleFocus}"
          @blur=${this.toggleFocus}
        />

        <il-button-icon-with-tooltip
          @click=${() => {
            this.clear();
            this.search();
          }}
          .content=${this.value !== "" ? IconNames.close : IconNames.magnify}
          .tooltipText=${TooltipTexts.clearButton}
          .condition=${this.value}
        ></il-button-icon-with-tooltip>
      </div>
    `;
  }

  search() {
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
