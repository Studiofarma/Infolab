import { LitElement, html } from "lit";

import "../../../../components/formatting-button";

import { MarkdownService } from "../../../../services/markdown-service";
import { IconNames } from "../../../../enums/icon-names";

export class EditorFormattingButtons extends LitElement {
  static properties = {
    editor: undefined,
  };

  render() {
    return html`
      <il-formatting-button
        content=${IconNames.bold}
        @click=${() => this.formatText("bold")}
      ></il-formatting-button>

      <il-formatting-button
        content=${IconNames.italic}
        @click=${this.insertItalic}
      ></il-formatting-button>

      <il-formatting-button
        content=${IconNames.strikethrough}
        @click=${this.insertStrike}
      ></il-formatting-button>

      <il-formatting-button
        content=${IconNames.link}
        @click=${this.insertLink}
      ></il-formatting-button>

      <il-formatting-button
        content=${IconNames.minus}
        @click=${this.insertLine}
      ></il-formatting-button>

      <il-formatting-button
        content=${IconNames.listBulleted}
        @click=${this.insertListBulleted}
      ></il-formatting-button>

      <il-formatting-button
        content=${IconNames.listNumbered}
        @click=${this.insertListNumbered}
      ></il-formatting-button>

      <il-formatting-button
        content=${IconNames.title}
        @click=${MarkdownService.insertHeading}
      ></il-formatting-button>
    `;
  }

  formatText() {
    const selection = this.editor.value.quill.getSelection();

    this.editor.value.quill.formatText(
      selection.index,
      selection.length,
      "bold"
    );
  }

  insertItalic() {
    const selectedText = this.editor.value.getSelectedText();
    this.editor.value.insertInTextarea(
      MarkdownService.insertItalic(selectedText)
    );
  }

  insertStrike() {
    const selectedText = this.editor.value.getSelectedText();
    this.editor.value.insertInTextarea(
      MarkdownService.insertStrike(selectedText)
    );
  }

  insertLink() {
    const selectedText = this.editor.value.getSelectedText();
    this.editor.value.insertInTextarea(
      MarkdownService.insertLink(selectedText)
    );
  }

  insertLine() {
    const selectedText = this.editor.value.getSelectedText();
    this.editor.value.insertInTextarea(
      MarkdownService.insertLine(selectedText)
    );
  }

  insertListBulleted() {
    const selectedText = this.editor.value.getSelectedText();
    this.editor.value.insertInTextarea(
      MarkdownService.insertListBulleted(selectedText)
    );
  }

  insertListNumbered() {
    const selectedText = this.editor.value.getSelectedText();
    this.editor.value.insertInTextarea(
      MarkdownService.insertListNumbered(selectedText)
    );
  }

  insertHeading() {
    const selectedText = this.editor.value.getSelectedText();
    this.editor.value.insertInTextarea(
      MarkdownService.insertHeading(selectedText)
    );
  }
}
customElements.define("il-editor-formatting-buttons", EditorFormattingButtons);
