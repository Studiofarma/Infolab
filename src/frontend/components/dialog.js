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
      overflow-y: auto;
    }

    dialog::backdrop {
      background-color: #00000037;
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
      background-color: rgb(54, 123, 251);
    }

    .forward-list {
      width: 400px;
      color: white
    }


  `;

  render() {
    return html`
      <dialog
        ${ref(this.dialogRef)}
        class=${this.theme}
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
