import { LitElement, html, css } from "lit";
import { MarkdownService } from "../../../../services/markdown-service";

import "../../../../components/button-text";

export class Editor extends LitElement {
  static properties = {
    message: { type: String },
    rows: { type: Number },
    openPreview: { type: Boolean },
    altPressed: { type: Boolean },
    shiftPressed: { type: Boolean },
  };

  constructor() {
    super();
    this.lastKeyPressed = "";
    this.rows = 1;
    this.altPressed = false;
    this.shiftPressed = false;
    this.message = "";
  }

  static styles = css`
    textarea {
      width: 100%;
      resize: none;
      font-size: 20px;
      outline: none;
      background: none;
      color: white;
      border: 0;
      font-family: "Inter", "Helvetica Neue", Helvetica, Arial, sans-serif;
      border-left: 3px solid white;
      padding-left: 10px;
      line-height: 20px;
    }
    textarea::placeholder {
      color: lightgray;
    }
    textarea::-webkit-scrollbar {
      background: lightgray;
      width: 5px;
      border-top: 2px solid gray;
      border-bottom: 2px solid gray;
    }

    textarea::-webkit-scrollbar-thumb {
      background: gray;
    }
    @font-face {
      font-family: "Inter";
      src: url(../../../../assets/fonts/inter.ttf);
    }
  `;

  render() {
    return html`
      <textarea
        rows=${this.rows <= 5 ? this.rows : 5}
				max
        @input=${this.onInput}
        @keydown=${this.onKeyDown}
        @keyup=${this.onKeyUp}
        @select=${this.onSelect}
        placeholder="Scrivi un messaggio..."
      ></textarea>
    `;
  }

  onInput(event) {
    this.message = event.target.value;
    this.rows = event.target.value.split("\n").length;
    this.textChanged();
  }

  textChanged() {
    this.shadowRoot.querySelector("textarea").value = this.message;
    this.dispatchEvent(
      new CustomEvent("text-changed", {
        detail: { content: this.message.trimEnd().replaceAll("\n", "\\\n") },
      })
    );
  }

  getSelection() {
    const textarea = this.shadowRoot.querySelector("textarea");
    return {
      start: textarea.selectionStart,
      end: textarea.selectionEnd,
      direction: textarea.selectionDirection,
    };
  }

  onKeyDown(event) {
    if (event.key == "Shift") this.shiftPressed = true;
    if (event.key == "Alt") this.altPressed = true;

    if (!this.shiftPressed && event.key == "Enter") {
      this.dispatchEvent(new CustomEvent("enter-key-pressed"));
      event.preventDefault();
    }

    this.checkMarkdownKeys(event.key);
    this.lastKeyPressed = event.key;
  }

  clearMessage() {
    this.message = "";
    this.rows = 1;
    this.shadowRoot.querySelector("textarea").value = "";
  }

  onKeyUp(event) {
    if (event.key == "Shift") this.shiftPressed = false;
    if (event.key == "Alt") this.altPressed = false;
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

  checkMarkdownKeys(currentKeyPressed) {
    if (this.altPressed && currentKeyPressed === "b") {
      MarkdownService.insertBold();
      return;
    }
    if (this.altPressed && currentKeyPressed === "i") {
      MarkdownService.insertItalic();
      return;
    }
    if (this.altPressed && currentKeyPressed === "s") {
      MarkdownService.insertStrike();
      return;
    }
    if (this.altPressed && currentKeyPressed === "l") {
      MarkdownService.insertLink();
      return;
    }
  }
}
customElements.define("il-editor", Editor);
