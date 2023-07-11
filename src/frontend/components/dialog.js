import { LitElement, html, css } from "lit";
import { ref, createRef } from "lit/directives/ref.js";

import { ThemeColorService } from "../services/theme-color-service";

import { VariableNames } from "../enums/theme-colors";

export class Dialog extends LitElement {
  static properties = {
    isOpened: { type: Boolean },
    dialogRef: { type: Object },
    type: { type: String },
  };

  constructor() {
    super();
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
      box-shadow: ${VariableNames.boxShadowSecondary} 0px 1px 4px;
      border-radius: 6px;
      padding: 8px;
      transition: 0.5s;
      overflow-y: auto;
    }
    
    dialog::backdrop {
      // importo anche qua il servizio per rendere visibili le variabili nello pseudo-elemento
      ${ThemeColorService.getThemeVariables()};
      background-color: ${VariableNames.backdrop};
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
      background-color: ${VariableNames.scrollbar};
    }
  `;

  render() {
    return html`
      <dialog
        ${ref(this.dialogRef)}
        @click=${(event) => {
          this.dispatchEvent(
            new CustomEvent("dialog-clicked", {
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

  // Getters & Setters

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

  // -----------------------------

  willUpdate(changed) {
    if (changed.has("isOpened") && this.type === "modal")
      this.isOpened
        ? this.dialogRef.value.showModal()
        : this.dialogRef.value.close();

    if (changed.has("isOpened") && this.type === "popover")
      this.isOpened
        ? this.dialogRef.value.show()
        : this.dialogRef.value.close();
  }
}
customElements.define("il-dialog", Dialog);
