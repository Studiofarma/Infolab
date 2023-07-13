import { LitElement, html } from "lit";
import { ref, createRef } from "lit/directives/ref.js";

import "./dialog.js";

const esc = "Escape";

export class Modal extends LitElement {
  static properties = {
    isClosableByBackdropClick: { type: Boolean },
    ilDialogRef: { type: Object },
  };

  constructor() {
    super();
    this.isClosableByBackdropClick = true;
    this.ilDialogRef = createRef();
    document.addEventListener("keydown", (e) => this.onKeyDown(e));
  }

  render() {
    return html`
      <il-dialog
        type="modal"
        ${ref(this.ilDialogRef)}
        @il:dialog-clicked=${this.handleDialogClicked}
      >
        <slot></slot>
      </il-dialog>
    `;
  }

  //#region Getter & Setters

  getDialogRefIsOpened() {
    return this.ilDialogRef.value?.getIsOpened();
  }

  setDialogRefIsOpened(value) {
    this.ilDialogRef.value?.setIsOpened(value);
  }

  getDialogRefOffsetWidth() {
    return this.ilDialogRef.value?.getOffsetWidth();
  }

  getDialogRefOffsetHeight() {
    return this.ilDialogRef.value?.getOffsetHeight();
  }

  //#endregion

  onKeyDown(e) {
    if (e.key == esc) {
      this.closeDialog();
    }
  }

  isClickOuter(event) {
    if (event.detail.x < 0) return true;
    if (event.detail.x > this.getDialogRefOffsetWidth()) return true;
    if (event.detail.y < 0) return true;
    if (event.detail.y > this.getDialogRefOffsetHeight()) return true;

    return false;
  }

  handleDialogClicked(event) {
    if (this.isClosableByBackdropClick && this.isClickOuter(event)) {
      this.closeDialog();
    }
  }

  closeDialog() {
    this.dispatchEvent(new CustomEvent("il:modal-closed"));
    this.setDialogRefIsOpened(false);
  }
}

customElements.define("il-modal", Modal);
