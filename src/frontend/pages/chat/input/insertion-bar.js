import { LitElement, html, css } from "lit";

import "../../../components/button-icon";
import "./editor/editor-formatting-buttons";

import { IconNames } from "../../../enums/icon-names";

export class InsertionBar extends LitElement {
  static properties = {
    bEditor: false,
  };

  static styles = css`
    div {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 1px;
      color: white;
    }
    il-editor-formatting-buttons {
      display: flex;
    }
  `;

  render() {
    return html`
      <div @click=${this.select_formatting_option}>
        <il-button-icon content=${IconNames.emoticon}></il-button-icon>
        <il-button-icon
          content=${IconNames.pencil}
          @click=${() => (this.bEditor = !this.bEditor)}
        ></il-button-icon>
        ${this.bEditor
          ? html`<il-editor-formatting-buttons></il-editor-formatting-buttons>`
          : ""}
      </div>
    `;
  }

  select_formatting_option(e) {
    const option = e.target.content;
    this.dispatchEvent(
      new CustomEvent("open-insertion-mode", {
        detail: {
          bEmoji: option === IconNames.emoticon,
        },
      })
    );
  }
}

customElements.define("il-insertion-bar", InsertionBar);
