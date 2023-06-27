import { LitElement, html, css } from "lit";
import { ref, createRef } from "lit/directives/ref.js";

import "./dialog.js";

export class Modal extends LitElement {
  static properties = {
    closeByBackdropClick: { type: Boolean },
  };

  constructor() {
    super();
    this.closeByBackdropClick = true;
  }


  render() {
    return html`
      <il-dialog>
        <slot></slot>
      </il-dialog>
    `;
  }

  
  isClickOuter(event) {
    if (event.offsetX < 0) return true;
    if (event.offsetX > this.dialogRef.value.offsetWidth) return true;
    if (event.offsetY < 0) return true;
    if (event.offsetY > this.dialogRef.value.offsetHeight) return true;

    return false;
  }

  handleClick(event) {
    if (this.closeByBackdropClick && this.isClickOuter(event))
      this.isOpened = false;
  }
}

customElements.define("il-modal", Modal);
