import { LitElement, html, css } from "lit";
import { ref, createRef } from "lit/directives/ref.js";

import "./dialog.js";

export class Modal extends LitElement {
  static properties = {
    closeByBackdropClick: { type: Boolean },
    theme: { type: String },
    ilDialogRef: { type: Object },
  };

  constructor() {
    super();
    this.closeByBackdropClick = true;
    this.theme = "";
    this.ilDialogRef = createRef();
  }

  render() {
    return html`
      <il-dialog
        type="modal"
        theme=${this.theme}
        ${ref(this.ilDialogRef)}
        @dialog-clicked=${this.handleClick}
      >
        <slot></slot>
      </il-dialog>
    `;
  }

  isClickOuter(event) {
    if (event.detail.x < 0) return true;
    if (event.detail.x > this.ilDialogRef.value.dialogRef.value.offsetWidth) return true;
    if (event.detail.y < 0) return true;
    if (event.detail.y > this.ilDialogRef.value.dialogRef.value.offsetHeight) return true;

    return false;
  }

  handleClick(event) {
    if (this.closeByBackdropClick && this.isClickOuter(event))
      this.ilDialogRef.value.isOpened = false;
  }
}

customElements.define("il-modal", Modal);
