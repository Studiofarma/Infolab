import { LitElement, html, css } from "lit";
import { styleMap } from "lit-html/directives/style-map.js";
export class Modal extends LitElement {
  static properties = {
    isOpened: { type: Boolean },
    closeByBackdropClick: { type: Boolean },
    styleProperties: { type: Object },
  };

  constructor() {
    super();
    this.closeByBackdropClick = true;
    this.styleProperties = { background: "", color: "", width: "" };
  }

  static styles = css`
    dialog {
      z-index: 5000;
      border: none;
      box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
      border-radius: 6px;
      padding: 8px;
      transition: animation 0.5s;
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

    dialog::backdrop {
      background-color: #00000037;
    }

    dialog[open] {
      animation: opening 0.5s ease-out;
    }

    @keyframes opening {
      from {
        transform: scale(0%);
      }
      to {
        transform: scale(100%);
      }
    }
  `;

  render() {
    return html`
      <dialog
        @click=${this.handleClick}
        style=${styleMap(this.styleProperties)}
      >
        <slot></slot>
      </dialog>
    `;
  }

  isClickOuter(event) {
    let dialog = this.renderRoot.querySelector("dialog");

    return (
      event.offsetX < 0 ||
      event.offsetX > dialog.offsetWidth ||
      event.offsetY < 0 ||
      event.offsetY > dialog.offsetHeight
    );
  }

  handleClick(event) {
    if (this.closeByBackdropClick && this.isClickOuter(event))
      this.isOpened = false;
  }

  willUpdate(changed) {
    let dialog = this.renderRoot.querySelector("dialog");

    if (changed.has("isOpened") && this.isOpened) dialog.showModal();

    if (changed.has("isOpened") && !this.isOpened) dialog.close();
  }
}

customElements.define("il-modal", Modal);
