import { LitElement, html } from "lit";

import "../../../../components/formatting-button";

import { MarkdownService } from "../../../../services/markdown-service";

import { IconNames } from "../../../../enums/icon-names";
import { TooltipTexts } from "../../../../enums/tooltip-texts";

import "../../../../components/tooltip";

export class EditorFormattingButtons extends LitElement {
  static properties = {
    editor: undefined,
  };

  render() {
    return html`
      <div>
        <il-formatting-button
          content=${IconNames.bold}
          @click=${this.insertBold}
        ></il-formatting-button>
        <il-tooltip>${TooltipTexts.bold}</il-tooltip>
      </div>

      <div>
        <il-formatting-button
          content=${IconNames.italic}
          @click=${this.insertItalic}
        ></il-formatting-button>
        <il-tooltip>${TooltipTexts.italic}</il-tooltip>
      </div>

      <div>
        <il-formatting-button
          content=${IconNames.strikethrough}
          @click=${this.insertStrike}
        ></il-formatting-button>
        <il-tooltip>${TooltipTexts.strikethrough}</il-tooltip>
      </div>

      <div>
        <il-formatting-button
          content=${IconNames.link}
          @click=${this.insertLink}
        ></il-formatting-button>
        <il-tooltip>${TooltipTexts.link}</il-tooltip>
      </div>

      <div>
        <il-formatting-button
          content=${IconNames.minus}
          @click=${this.insertLine}
        ></il-formatting-button>
        <il-tooltip>${TooltipTexts.line}</il-tooltip>
      </div>

      <div>
        <il-formatting-button
          content=${IconNames.listBulleted}
          @click=${this.insertListBulleted}
        ></il-formatting-button>
        <il-tooltip>${TooltipTexts.listBulleted}</il-tooltip>
      </div>

      <div>
        <il-formatting-button
          content=${IconNames.listNumbered}
          @click=${this.insertListNumbered}
        ></il-formatting-button>
        <il-tooltip>${TooltipTexts.listNumbered}</il-tooltip>
      </div>

      <div>
        <il-formatting-button
          content=${IconNames.title}
          @click=${MarkdownService.insertHeading}
        ></il-formatting-button>
        <il-tooltip>${TooltipTexts.title}</il-tooltip>
      </div>
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
