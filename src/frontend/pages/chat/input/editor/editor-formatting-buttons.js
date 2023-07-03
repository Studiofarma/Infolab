import { LitElement, html } from "lit";

import "../../../../components/formatting-button";

import { MarkdownService } from "../../../../services/markdown-service";

import { IconNames } from "../../../../enums/icon-names";
import { TooltipTexts } from "../../../../enums/tooltip-texts";

export class EditorFormattingButtons extends LitElement {
  static properties = {
    editor: undefined,
  };

  render() {
    return html`
      <il-button-icon-with-tooltip
        .content=${IconNames.bold}
        @click=${this.insertBold}
        .tooltipText=${TooltipTexts.bold}
      ></il-button-icon-with-tooltip>

      <il-button-icon-with-tooltip
        .content=${IconNames.italic}
        @click=${this.insertItalic}
        .tooltipText=${TooltipTexts.italic}
      ></il-button-icon-with-tooltip>

      <il-button-icon-with-tooltip
        .content=${IconNames.strikethrough}
        @click=${this.insertStrike}
        .tooltipText=${TooltipTexts.strikethrough}
      ></il-button-icon-with-tooltip>

      <il-button-icon-with-tooltip
        .content=${IconNames.link}
        @click=${this.insertLink}
        .tooltipText=${TooltipTexts.link}
      ></il-button-icon-with-tooltip>

      <il-button-icon-with-tooltip
        .content=${IconNames.minus}
        @click=${this.insertLine}
        .tooltipText=${TooltipTexts.line}
      ></il-button-icon-with-tooltip>

      <il-button-icon-with-tooltip
        .content=${IconNames.listBulleted}
        @click=${this.insertListBulleted}
        .tooltipText=${TooltipTexts.listBulleted}
      ></il-button-icon-with-tooltip>

      <il-button-icon-with-tooltip
        .content=${IconNames.listNumbered}
        @click=${this.insertListNumbered}
        .tooltipText=${TooltipTexts.listNumbered}
      ></il-button-icon-with-tooltip>

      <il-button-icon-with-tooltip
        .content=${IconNames.title}
        @click=${MarkdownService.insertHeading}
        .tooltipText=${TooltipTexts.title}
      ></il-button-icon-with-tooltip>
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
