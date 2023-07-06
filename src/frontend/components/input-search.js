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

  onIconClick() {
    this.inputRef.value?.clear();
    this.search();
    this.requestUpdate();
  }

  onInput() {
    this.search();
    this.requestUpdate();
  }

  firstUpdated(c) {
    console.log(this.inputRef.value?.value === "");
  }

  search() {
    this.dispatchEvent(
      new CustomEvent("search", {
        detail: {
          query: this.inputRef.value?.value,
        },
        bubbles: true,
        composed: true,
      })
    );

    this.inputRef.value?.focus();
  }
}

customElements.define("il-input-ricerca", InputRicerca);
