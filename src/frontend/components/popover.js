import { LitElement, html, css } from "lit";
import { styleMap } from "lit-html/directives/style-map.js";

export class Popover extends LitElement {
  static properties = {
    isOpened: { type: Boolean },
    leaveByDefault: { type: Boolean },
    popupCoords: { type: Object },
  };

  constructor() {
    super();
    this.leaveByDefault = true;
    this.popupCoords = { top: "0px", right: "0px", left: "0px", bottom: "0px" };
  }

  static styles = css`
    div {
      position: relative;
    }

    dialog {
      border: none;
      outline: none;
      box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
      border-radius: 6px;
      padding: 8px;
      transition: 0.5s;
      position: absolute;
      top: 0px;
    }
  `;

  render() {
    return html`
      <div @mouseleave=${this.handleLeave}>
        <slot name="pop-button" @click=${this.handleClick}> </slot>

        <dialog style=${styleMap(this.popupCoords)}>
          <slot name="popup"></slot>
        </dialog>
      </div>
    `;
  }

  handleClick() {
    this.isOpened = true;
  }

  handleLeave() {
    if (this.leaveByDefault) this.isOpened = false;
  }

  willUpdate(changed) {
    let dialog = this.renderRoot.querySelector("dialog");

    if (changed.has("isOpened") && this.isOpened) dialog.show();

    if (changed.has("isOpened") && !this.isOpened) dialog.close();
  }
}
customElements.define("il-popover", Popover);
