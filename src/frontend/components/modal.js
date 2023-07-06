import { LitElement, html } from "lit";
import { ref, createRef } from "lit/directives/ref.js";

import "./dialog.js";

const esc = "Escape";

export class Modal extends LitElement {
  static properties = {
    closeByBackdropClick: { type: Boolean },
    ilDialogRef: { type: Object },
  };

  constructor() {
    super();
    this.closeByBackdropClick = true;
    this.ilDialogRef = createRef();
    document.addEventListener("keydown", (e) => this.onKeyDown(e));
  }

  render() {
    return html`
      <il-dialog
        type="modal"
        ${ref(this.ilDialogRef)}
        @dialog-clicked=${this.handleClick}
      >
        <slot></slot>
      </il-dialog>
    `;
  }

  onKeyDown(e) {
    if (e.key == esc) this.ilDialogRef.value.isOpened = false;
  }

  isClickOuter(event) {
    if (event.detail.x < 0) return true;
    if (event.detail.x > this.ilDialogRef.value.dialogRef.value.offsetWidth)
      return true;
    if (event.detail.y < 0) return true;
    if (event.detail.y > this.ilDialogRef.value.dialogRef.value.offsetHeight)
      return true;

    return false;
  }

  handleClick(event) {
    if (this.closeByBackdropClick && this.isClickOuter(event)) {
      this.dispatchEvent(new CustomEvent("modal-closed"));
      this.ilDialogRef.value.isOpened = false;
    }
  }

  openModal() {
    this.ilDialogRef.value?.openDialog();
  }

  closeModal() {
    this.ilDialogRef.value?.closeDialog();
  }
}

customElements.define("il-modal", Modal);
