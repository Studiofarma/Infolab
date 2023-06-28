import { LitElement, html, css } from "lit";
import { styleMap } from "lit-html/directives/style-map.js";
import { ref, createRef } from "lit/directives/ref.js";

import "./dialog.js";

export class Popover extends LitElement {
  static properties = {
    leaveByDefault: { type: Boolean },
    popupCoords: { type: Object },
    theme: { type: String },
    ilDialogRef: { type: Object },
  };

  constructor() {
    super();
    this.leaveByDefault = true;
    this.popupCoords = { top: "0px", right: "0px", left: "0px", bottom: "0px" };
    this.theme = "";
    this.ilDialogRef = createRef();
  }

  static styles = css`
    .container {
      position: relative;
    }

    .popup-container {
      position: absolute;
    }
  `;

  render() {
    return html`
      <div @mouseleave=${this.handleLeave} class="container">
        <slot name="pop-button" @click=${this.handleClick}></slot>

        <div class="popup-container" style=${styleMap(this.popupCoords)}>
          <il-dialog type="popover" ${ref(this.ilDialogRef)}>
            <slot name="popup"></slot>
          </il-dialog>
        </div>
      </div>
    `;
  }

  handleClick() {
    this.ilDialogRef.value.isOpened = true;
  }

  handleLeave() {
    if (this.leaveByDefault) this.ilDialogRef.value.isOpened = false;
  }
}
customElements.define("il-popover", Popover);
