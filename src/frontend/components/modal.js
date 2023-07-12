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

  // Getter & Setters

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

  // ------------------------------

  onKeyDown(e) {
    if (e.key == esc) this.setDialogRefIsOpened(false);
  }

  isClickOuter(event) {
    if (event.detail.x < 0) return true;
    if (event.detail.x > this.getDialogRefOffsetWidth()) return true;
    if (event.detail.y < 0) return true;
    if (event.detail.y > this.getDialogRefOffsetHeight()) return true;

    return false;
  }

  handleClick(event) {
    if (this.closeByBackdropClick && this.isClickOuter(event)) {
      this.dispatchEvent(new CustomEvent("modal-closed"));
      this.setDialogRefIsOpened(false);
    }
  }
}

customElements.define("il-modal", Modal);
