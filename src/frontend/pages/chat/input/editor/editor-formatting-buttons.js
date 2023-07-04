import { LitElement, html } from "lit";

import { MarkdownService } from "../../../../services/markdown-service";

import { IconNames } from "../../../../enums/icon-names";
import { TooltipTexts } from "../../../../enums/tooltip-texts";

import "../../../../components/formatting-button";
import "../../../../components/button-icon";

export class EditorFormattingButtons extends LitElement {
  static properties = {
    editor: undefined,
  };

  render() {
    return html`
      <il-button-icon
        .content=${IconNames.bold}
        @click=${this.insertBold}
        .tooltipText=${TooltipTexts.bold}
      ></il-button-icon>

      <il-button-icon
        .content=${IconNames.italic}
        @click=${this.insertItalic}
        .tooltipText=${TooltipTexts.italic}
      ></il-button-icon>

      <il-button-icon
        .content=${IconNames.strikethrough}
        @click=${this.insertStrike}
        .tooltipText=${TooltipTexts.strikethrough}
      ></il-button-icon>

      <il-button-icon
        .content=${IconNames.link}
        @click=${this.insertLink}
        .tooltipText=${TooltipTexts.link}
      ></il-button-icon>

      <il-button-icon
        .content=${IconNames.minus}
        @click=${this.insertLine}
        .tooltipText=${TooltipTexts.line}
      ></il-button-icon>

      <il-button-icon
        .content=${IconNames.listBulleted}
        @click=${this.insertListBulleted}
        .tooltipText=${TooltipTexts.listBulleted}
      ></il-button-icon>

      <il-button-icon
        .content=${IconNames.listNumbered}
        @click=${this.insertListNumbered}
        .tooltipText=${TooltipTexts.listNumbered}
      ></il-button-icon>

      <il-button-icon
        .content=${IconNames.title}
        @click=${MarkdownService.insertHeading}
        .tooltipText=${TooltipTexts.title}
      ></il-button-icon>
    `;
  }

  insertBold() {
    const selectedText = this.editor.value.getSelectedText();
    this.editor.value.insertInTextarea(
      MarkdownService.insertBold(selectedText)
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
