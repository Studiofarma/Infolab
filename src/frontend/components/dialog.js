import { LitElement, html, css, unsafeCSS } from "lit";
import { ref, createRef } from "lit/directives/ref.js";

export class Dialog extends LitElement {
  static properties = {
    isOpened: { type: Boolean },
    type: { type: String },
    dialogRef: { type: Object },
    theme: { type: String },
  };

  constructor() {
    super();
    this.dialogRef = createRef();
  }

  static styles = css`
    dialog {
      width: 100%;
      border: none;
      outline: none;
      box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
      border-radius: 6px;
      padding: 8px;
      transition: 0.5s;
      overflow: hidden;
    }

    dialog::backdrop {
      background-color: ${this.type === "modal"
        ? unsafeCSS("#00000037")
        : unsafeCSS("transparent")};
    }

  `;

  render() {
    return html`
      <dialog ${ref(this.dialogRef)}>
        <slot></slot>
      </dialog>
    `;
  }

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
