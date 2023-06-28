import { LitElement, html, css } from "lit";
import { ref, createRef } from "lit/directives/ref.js";

export class Dialog extends LitElement {
  static properties = {
    isOpened: { type: Boolean },
    dialogRef: { type: Object },
    type: { type: String },
    theme: { type: String },
  };

  constructor() {
    super();
    this.dialogRef = createRef();
  }

  static styles = css`
    dialog {
      width: fit-content;
      border: none;
      outline: none;
      box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
      border-radius: 6px;
      padding: 8px;
      transition: 0.5s;
      overflow: hidden;
    }

    dialog::backdrop {
      background-color:#00000037;
    }

    .forward-blue {
      width: 400px;
      background: #083c72;
      color: "white";
      max-height: 700px;
    }
  `;

  render() {
    return html`
      <dialog ${ref(this.dialogRef)} class=${this.theme} @click=${(event) => {
        this.dispatchEvent(new CustomEvent("dialog-clicked", {detail: event.detail}))
      }}>
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
