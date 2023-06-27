import { LitElement, html, css } from "lit";
import { MarkdownService } from "../../../../services/markdown-service";

import "../../../../components/button-text";

const textareaDefaultHeight = 21;
const keys = {
  enter: "Enter",
  bold: "b",
  italic: "i",
  strike: "s",
  link: "l",
};

export class Editor extends LitElement {
  static properties = {
    message: { type: String },
  };

  constructor() {
    super();
    this.message = "";
  }

  static styles = css`
    textarea {
      width: 100%;
      resize: none;
      font-size: ${textareaDefaultHeight}px;
      outline: none;
      background: none;
      color: white;
      border: 0;
      font-family: inherit;
      border-left: 3px solid white;
      padding-left: 10px;
      line-height: 20px;
      max-height: 100px;
      height: ${textareaDefaultHeight}px;
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
    textarea.style.height = `${textareaDefaultHeight}px`;
    textarea.style.height = `${textarea.scrollHeight}px`;
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
    if (event.key == keys.enter) {
      if (event.shiftKey) {
        this.checkList(event);
      } else {
        this.dispatchEvent(new CustomEvent("enter-key-pressed"));
        event.preventDefault();
      }
    }

    this.focusTextarea();

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
    let indexOfDot;

    if (MarkdownService.checkUnorderedList(lastRow)) {
      this.message += "\n* ";
      event.preventDefault();
    } else if (
      (indexOfDot = MarkdownService.checkOrderedList(lastRow)) !== -1
    ) {
      const lineNumber = Number(lastRow.substring(0, indexOfDot)) + 1;
      this.message += `\n${lineNumber}. `;
      event.preventDefault();
    }

    this.textChanged();
    this.textEditorResize();
  }

  checkMarkdownKeys(currentKeyPressed) {
    const selectedText = this.getSelectedText();
    let textToInsert = selectedText;

    switch (currentKeyPressed) {
      case keys.bold:
        textToInsert = MarkdownService.insertBold(selectedText);
        break;
      case keys.italic:
        textToInsert = MarkdownService.insertItalic(selectedText);
        break;
      case keys.strike:
        textToInsert = MarkdownService.insertStrike(selectedText);
        break;
      case keys.link:
        textToInsert = MarkdownService.insertLink(selectedText);
        break;
    }

    this.insertInTextarea(textToInsert);
  }

  getTextarea() {
    return this.shadowRoot.querySelector("textarea");
  }

  insertInTextarea(text) {
    const textarea = this.getTextarea();
    const selection = this.getSelection();

    this.message =
      textarea.value.slice(0, selection.start) +
      text +
      textarea.value.slice(selection.end);

    this.textChanged();
    this.focusTextarea();
  }

  focusTextarea() {
    const textarea = this.getTextarea();

    textarea.blur();
    textarea.focus();
  }

  getSelectedText() {
    const textarea = this.getTextarea();
    const selection = this.getSelection();

    return textarea.value.slice(selection.start, selection.end);
  }
}
customElements.define("il-editor", Editor);
