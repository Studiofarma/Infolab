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
      --border-size: 2px;
    }

    emoji-picker.light {
      --background: #f8f8f8;
      --input-font-color: black;
      --input-placeholder-color: black;
      --outline-color: black;
    }

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
    this.dispatchEvent(new CustomEvent("picker-close"));
  }
}

customElements.define("il-emoji-picker", EmojiPicker);
