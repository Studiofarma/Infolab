import { LitElement, html } from "lit";
import { ref, createRef } from "lit/directives/ref.js";

import { InputField } from "./input-field";

import { IconNames } from "../enums/icon-names";

import "./button-icon";
import "./input-with-icon";

export class InputRicerca extends LitElement {
  constructor() {
    super();
    this.inputRef = createRef();
  }

  render() {
    return html`
      <il-input-with-icon
        ${ref(this.inputRef)}
        .iconName=${this.inputRef.value?.value
          ? IconNames.close
          : IconNames.magnify}
        @input=${this.onInput}
        @icon-click=${this.onIconClick}
        placeholder="Cerca o inizia una nuova conversazione"
      ></il-input-with-icon>
    `;
  }

  clear() {
    this.inputRef.value?.clear();
  }

  onIconClick() {
    this.clear();
    this.search();
    this.requestUpdate();
  }

  onInput() {
    this.search();
    this.requestUpdate();
  }

  getInputValue() {
    this.inputRef.value?.getInputValue();
  }

  search() {
    this.dispatchEvent(
      new CustomEvent("search", {
        detail: {
          query: this.inputRef.value?.getInputValue(),
        },
      })
    );

    this.inputRef.value?.focus();
  }
}

customElements.define("il-input-ricerca", InputRicerca);
