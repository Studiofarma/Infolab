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
    emoji-picker {
      --emoji-size: 15pt;
      --background: #f8f8f8;
      --border-size: 2px;
      --input-font-color: black;
      --input-placeholder-color: black;
      --outline-color: black;
    }
  `;

  render() {
    return html`
      <emoji-picker
        .i18n=${it}
        locale="it"
        class="light"
        ?hidden=${!this.isOpen}
        @click=${this.closePicker}
      ></emoji-picker>
    `;
  }

  closePicker(event) {
    if (event.target != "emoji-picker.light") this.isOpen = false;
  }
}

customElements.define("il-emoji-picker", EmojiPicker);
