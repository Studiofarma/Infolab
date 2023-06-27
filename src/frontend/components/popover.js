import { LitElement, html, css } from "lit";
import { styleMap } from "lit-html/directives/style-map.js";
import { ref, createRef } from 'lit/directives/ref.js';

import "./dialog.js"

export class Popover extends LitElement {
  static properties = {
    leaveByDefault: { type: Boolean },
    popupCoords: { type: Object },
  };

  constructor() {
    super();
    this.leaveByDefault = true;
    this.popupCoords = { top: "0px", right: "0px", left: "0px", bottom: "0px" };
  }

  render() {
    return html`
      <div @mouseleave=${this.handleLeave}>
        <slot name="pop-button" @click=${this.handleClick}> </slot>

        <dialog style=${styleMap(this.popupCoords)} ${ref(this.dialogRef)}>
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

}
customElements.define("il-popover", Popover);
