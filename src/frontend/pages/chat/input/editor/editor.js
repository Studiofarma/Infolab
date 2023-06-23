import { LitElement, html, css } from "lit";
import { MarkdownService } from "../../../../services/markdown-service";

import "../../../../components/button-text";

export class Editor extends LitElement {
  static properties = {
    message: { type: String },
    openPreview: { type: Boolean },
  };

  constructor() {
    super();
    this.lastKeyPressed = "";
    this.message = "";
  }

  static styles = css`
    textarea {
      width: 100%;
      resize: none;
      font-size: 21px;
      outline: none;
      background: none;
      color: white;
      border: 0;
      font-family: "Inter", "Helvetica Neue", Helvetica, Arial, sans-serif;
      border-left: 3px solid white;
      padding-left: 10px;
      line-height: 20px;
      max-height: 100px;
      height: 21px;
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
        @input=${this.onInput}
        @keydown=${this.onKeyDown}
        placeholder="Scrivi un messaggio..."
      ></textarea>
    `;
  }

  onInput(event) {
    this.message = event.target.value;
    this.textChanged();
    this.textEditorResize();
  }

  textChanged() {
    this.shadowRoot.querySelector("textarea").value = this.message;
    this.dispatchEvent(
      new CustomEvent("text-changed", {
        detail: { content: this.message },
      })
    );
  }

  textEditorResize() {
    const textarea = this.shadowRoot.querySelector("textarea");
    textarea.style.height = "21px";
    const scrollHeight = textarea.scrollHeight;
    textarea.style.height = `${scrollHeight}px`;
    this.dispatchEvent(
      new CustomEvent("text-editor-resized", {
        detail: { height: textarea.clientHeight },
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
    if (event.key == "Enter") {
      if (event.shiftKey) {
        this.checkList(event);
      } else {
        this.dispatchEvent(new CustomEvent("enter-key-pressed"));
        event.preventDefault();
      }
    }

    if (event.altKey) this.checkMarkdownKeys(event.key);
  }

  clearMessage() {
    this.message = "";
    this.shadowRoot.querySelector("textarea").value = "";
    this.textEditorResize();
  }

  checkList(event) {
    const rows = this.message.split("\n");
    let lastRow = rows[rows.length - 1].trimStart();

    if (lastRow.startsWith("* ")) {
      this.message += "\n* ";
      event.preventDefault();
      this.textChanged();
      this.textEditorResize();
      return;
    }

    const indexOfDot = lastRow.indexOf(".");
    if (indexOfDot === -1) return;
    for (let i = 0; i < indexOfDot; i++) {
      if (isNaN(Number(lastRow[i]))) return;
    }

    const lineNumber = Number(lastRow.substring(0, indexOfDot)) + 1;
    this.message += `\n${lineNumber}. `;
    event.preventDefault();
    this.textChanged();
    this.textEditorResize();
  }

  checkMarkdownKeys(currentKeyPressed) {
    if (currentKeyPressed === "b") {
      MarkdownService.insertBold();
      return;
    }
    if (currentKeyPressed === "i") {
      MarkdownService.insertItalic();
      return;
    }
    if (currentKeyPressed === "s") {
      MarkdownService.insertStrike();
      return;
    }
    if (currentKeyPressed === "l") {
      MarkdownService.insertLink();
      return;
    }
  }
}
customElements.define("il-editor", Editor);
