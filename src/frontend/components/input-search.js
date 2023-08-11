import { LitElement, html } from "lit";
import { ref, createRef } from "lit/directives/ref.js";

import { IconNames } from "../enums/icon-names";
import { TooltipTexts } from "../enums/tooltip-texts";

import "./button-icon";
import "./input-with-icon";

export class InputSearch extends LitElement {
  constructor() {
    super();

    // Refs
    this.inputWithIconRef = createRef();
  }

  render() {
    return html`
      <il-input-with-icon
        ${ref(this.inputWithIconRef)}
        .iconName=${this.getInputWithIconRefValue()
          ? IconNames.close
          : IconNames.magnify}
        .iconTooltipText=${this.getInputWithIconRefValue()
          ? TooltipTexts.clearButton
          : undefined}
        @input=${this.onInput}
        @il:icon-clicked=${this.handleIconClicked}
        placeholder="Cerca o inizia una nuova conversazione"
      ></il-input-with-icon>
    `;
  }

  //#region  Getters & Setters

  getInputWithIconRefValue() {
    return this.inputWithIconRef.value?.getInputValue();
  }

  setInputWithIconRefValue(value) {
    this.inputWithIconRef.value?.setInputValue(value);
  }

  //#endregion

  clear() {
    this.inputWithIconRef.value?.clear();
    this.requestUpdate();
  }

  focusInput() {
    this.inputWithIconRef.value?.focusInput();
  }

  handleIconClicked() {
    const inputValue = this.getInputWithIconRefValue();

    if (inputValue?.length !== 0) {
      this.clear();
      this.search();
      this.requestUpdate();
    } else {
      this.focusInput();
    }
  }

  onInput() {
    this.search();
    this.requestUpdate();
  }

  search() {
    this.dispatchEvent(
      new CustomEvent("il:searched", {
        detail: {
          query: this.inputWithIconRef.value?.getInputValue(),
        },
      })
    );

    this.focusInput();
  }
}

customElements.define("il-input-search", InputSearch);
