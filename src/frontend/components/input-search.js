import { LitElement, html } from "lit";
import { ref, createRef } from "lit/directives/ref.js";

import { IconNames } from "../enums/icon-names";

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
        @input=${this.onInput}
        @icon-click=${this.onIconClick}
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
  }

  focusInput() {
    this.inputWithIconRef.value?.focusInput();
  }

  onIconClick() {
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
      new CustomEvent("search", {
        detail: {
          query: this.inputWithIconRef.value?.getInputValue(),
        },
      })
    );

    this.focusInput();
  }
}

customElements.define("il-input-search", InputSearch);
