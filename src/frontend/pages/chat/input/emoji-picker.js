import { LitElement, html, css } from "lit";

import it from "emoji-picker-element/i18n/it";
import "emoji-picker-element";

export class EmojiPicker extends LitElement {
  static get properties() {
    return {
      isOpen: { type: Boolean },
    };
  }

  constructor() {
    super();
    this.isOpen = false;
  }

  static styles = css`
    div {
      width: 5000px;
      height: 5000px;
      position: fixed;
      top: 0;
      left: 0;
    }
  `;

  render() {
    return html`
      <div @click=${this.closePicker} ?hidden=${!this.isOpen}></div>
      <emoji-picker
        .i18n=${it}
        locale="it"
        class="light"
        ?hidden=${!this.isOpen}
      ></emoji-picker>
    `;
  }

  closePicker() {
    this.dispatchEvent(new CustomEvent("il:emoji-picker-closed"));
  }
}

customElements.define("il-emoji-picker", EmojiPicker);
