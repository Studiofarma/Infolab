import { LitElement, html, css } from "lit";
import { ref, createRef } from "lit/directives/ref.js";

import { MarkdownService } from "../../../../services/markdown-service";

import "../../../../components/button-text";

const textareaDefaultHeight = 21;
const textAreaWidthOffset = 20;
const keys = {
  tab: "Tab",
  enter: "Enter",
  // bold: "b",
  // italic: "i",
  // strike: "s",
  // link: "l",
};

export class Editor extends LitElement {
  static properties = {
    message: { type: String },
    isKeyDown: false,
  };

  constructor() {
    super();
    this.message = "";
    // Refs
    this.textareaRef = createRef();
  }

  static styles = css`
    textarea {
      width: calc(100% - ${textAreaWidthOffset}px);
      resize: none;
      font-size: ${textareaDefaultHeight}px;
      outline: none;
      background: none;
      color: black;
      border: 0;
      font-family: inherit;
      padding-left: 10px;
      max-height: 100px;
      height: ${textareaDefaultHeight}px;
      padding-bottom: 0;
    }

    textarea::placeholder {
      color: #6f7174;
    }

    ::-webkit-scrollbar {
      width: 4px;
    }

    ::-webkit-scrollbar-track {
      background-color: none;
    }

    ::-webkit-scrollbar-thumb {
      border-radius: 10px;
      background-color: #206cf7;
    }

    ::-webkit-scrollbar:vertical {
      margin-right: 10px;
    }
  `;

  render() {
    return html`
      <textarea
        ${ref(this.textareaRef)}
        @input=${this.onInput}
        @keydown=${this.onKeyDown}
        @keyup=${this.onKeyUp}
        @blur=${this.onBlur}
        placeholder="Scrivi un messaggio..."
      ></textarea>
    `;
  }

  getText() {
    return this.textareaRef.value?.value;
  }

  onInput(event) {
    if (this.isKeyDown) this.message = event.target.value;

    this.textChanged();
    this.textEditorResize();
    this.isKeyDown = false;
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

  firstUpdated() {
    this.textEditorResize();
  }

  focusTextArea() {
    this.textAreaRef.value.focus();
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
    this.isKeyDown = true;

    if (event.key == keys.enter) {
      if (event.shiftKey) {
        // this.checkList(event);
      } else {
        this.dispatchEvent(new CustomEvent("enter-key-pressed"));
        event.preventDefault();
      }
    }

    // if (event.altKey) this.checkMarkdownKeys(event.key);
  }

  onKeyUp() {
    this.isKeyDown = false;
  }

  onBlur(e) {
    this.isKeyDown = false;
  }

  clearMessage() {
    this.setEditorText("");
  }

  // checkList(event) {
  //   const rows = this.message.split("\n");
  //   let lastRow = rows[rows.length - 1].trimStart();
  //   let indexOfDot;

  //   if (MarkdownService.checkUnorderedList(lastRow)) {
  //     this.message += "\n* ";
  //     event.preventDefault();
  //   } else if (
  //     (indexOfDot = MarkdownService.checkOrderedList(lastRow)) !== -1
  //   ) {
  //     const lineNumber = Number(lastRow.substring(0, indexOfDot)) + 1;
  //     this.message += `\n${lineNumber}. `;
  //     event.preventDefault();
  //   }

  //   this.textChanged();
  //   this.textEditorResize();
  // }

  // checkMarkdownKeys(currentKeyPressed) {
  //   const selectedText = this.getSelectedText();
  //   let textToInsert = selectedText;

  //   switch (currentKeyPressed) {
  //     case keys.bold:
  //       textToInsert = MarkdownService.insertBold(selectedText);
  //       break;
  //     case keys.italic:
  //       textToInsert = MarkdownService.insertItalic(selectedText);
  //       break;
  //     case keys.strike:
  //       textToInsert = MarkdownService.insertStrike(selectedText);
  //       break;
  //     case keys.link:
  //       textToInsert = MarkdownService.insertLink(selectedText);
  //       break;
  //   }

  //   this.insertInTextarea(textToInsert);
  // }

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
    this.textEditorResize();
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

  setEditorText(text) {
    this.message = text;
    this.textareaRef.value.value = text;
    this.textEditorResize();
  }
}
customElements.define("il-editor", Editor);
