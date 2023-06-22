import { LitElement, html, css } from "lit";
import { resolveMarkdown } from "lit-markdown";
import { MarkdownService } from "../../../../services/markdown-service";

import "../../../../components/button-text";

export class Editor extends LitElement {
  static properties = {
    message: { type: String },
    openPreview: { type: Boolean },
    lastKeyPressed: { type: String },
  };

  constructor() {
    super();
    this.lastKeyPressed = "";
    this.alt = "Alt";
    this.shift = "Shift";
  }

  static styles = css`
    textarea {
      width: 100%;
      resize: none;
      font-size: x-large;
      padding: 5px;
      border-radius: 5px;
      outline: none;
      background: #003366;
      color: white;
      font-family: Inter;
    }
    @font-face {
      font-family: "Inter";
      src: url(../../../../assets/fonts/inter.ttf);
    }
  `;

  render() {
    return html`
      <textarea
        rows="1"
        @input=${this.onInput}
        @keydown=${this.onKeyDown}
      ></textarea>
    `;
  }

  onInput(event) {
    this.message = event.target.value.replaceAll("\n", "\\");
  }

  onKeyDown(event) {
    this.applyMarkdown(this.lastKeyPressed, event.key);
    this.lastKeyPressed = event.key;
  }

  checkList(event) {
    if (event.key === "Enter") {
      const rows = this.message.split("\n");
      let last_row = rows[rows.length - 1];
      const indexOfPoint = last_row.indexOf(".");

      if (last_row.startsWith("* ")) {
        this.message += "\n* ";
        event.preventDefault();
        return;
      }

      if (
        indexOfPoint != -1 &&
        !isNaN(parseInt(last_row.slice(0, indexOfPoint))) &&
        last_row.startsWith(". ", indexOfPoint)
      ) {
        this.message +=
          "\n" +
          (parseInt(last_row.slice(0, indexOfPoint)) + 1).toString() +
          ". ";
        event.preventDefault();
        return;
      }
    }
  }

  applyMarkdown(lastKeyPressed, currentKeyPressed) {
    if (lastKeyPressed === this.alt && currentKeyPressed === "b") {
      MarkdownService.insertBold();
      return;
    }
    if (lastKeyPressed === this.alt && currentKeyPressed === "i") {
      MarkdownService.insertItalic();
      return;
    }
    if (lastKeyPressed === this.alt && currentKeyPressed === "s") {
      MarkdownService.insertStrike();
      return;
    }
    if (lastKeyPressed === this.alt && currentKeyPressed === "l") {
      MarkdownService.insertLink();
      return;
    }
  }
}
customElements.define("il-editor", Editor);
