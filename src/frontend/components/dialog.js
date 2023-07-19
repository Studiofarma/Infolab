import { LitElement, html, css, adoptStyles } from "lit";
import { ref, createRef } from "lit/directives/ref.js";

import { ThemeColorService } from "../services/theme-color-service";

import { ThemeCSSVariables } from "../enums/theme-css-variables";

import { ElementMixin } from "../models/element-mixin";
export class Dialog extends ElementMixin(LitElement) {
  static properties = {
    isOpened: { type: Boolean },
    type: { type: String },
  };

  constructor() {
    super();

    // Refs
    this.dialogRef = createRef();
  }

  static styles = css`
    * {
      ${ThemeColorService.getThemeVariables()};
    }

    dialog {
      width: fit-content;
      border: none;
      outline: none;
      background-color: ${ThemeCSSVariables.dialogBg};
      box-shadow: ${ThemeCSSVariables.boxShadowSecondary} 0px 1px 4px;
      border-radius: 6px;
      padding: 8px;
      transition: 0.5s;
      overflow-y: auto;
    }

    dialog::backdrop {
      // importo anche qua il servizio per rendere visibili le variabili nello pseudo-elemento
      ${ThemeColorService.getThemeVariables()};
      background-color: ${ThemeCSSVariables.backdrop};
    }

    ::-webkit-scrollbar {
      width: 4px;
      margin-right: 10px;
    }

    ::-webkit-scrollbar-track {
      background-color: none;
    }

    ::-webkit-scrollbar-thumb {
      border-radius: 10px;
      background-color: ${ThemeCSSVariables.scrollbar};
    }
  `;

  render() {
    return html`
      <dialog
        ${ref(this.dialogRef)}
        @click=${(event) => {
          this.dispatchEvent(
            new CustomEvent("il:dialog-clicked", {
              detail: {
                x: event.offsetX,
                y: event.offsetY,
              },
            })
          );
        }}
      >
        <slot></slot>
      </dialog>
    `;
  }

  //#region Getters & Setters

  getIsOpened() {
    return this.isOpened;
  }

  setIsOpened(value) {
    this.isOpened = value;
  }

  getOffsetWidth() {
    return this.dialogRef.value.offsetWidth;
  }

  getOffsetHeight() {
    return this.dialogRef.value.offsetHeight;
  }

  //#endregion

  willUpdate(changed) {
    if (changed.has("isOpened") && this.type === "modal")
      this.isOpened
        ? this.dialogRef.value?.showModal()
        : this.dialogRef.value?.close();

    if (changed.has("isOpened") && this.type === "popover")
      this.isOpened
        ? this.dialogRef.value?.show()
        : this.dialogRef.value?.close();
  }
}
customElements.define("il-dialog", Dialog);
