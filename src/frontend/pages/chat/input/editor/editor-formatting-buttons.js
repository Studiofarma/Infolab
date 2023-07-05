import { LitElement, html } from "lit";

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
        @click=${() => this.formatText("bold")}
        .tooltipText=${TooltipTexts.bold}
      ></il-button-icon>

      <il-button-icon
        .content=${IconNames.italic}
        @click=${() => this.formatText("italic")}
        .tooltipText=${TooltipTexts.italic}
      ></il-button-icon>

      <il-button-icon
        .content=${IconNames.strikethrough}
        @click=${() => this.formatText("strikethrough")}
        .tooltipText=${TooltipTexts.strikethrough}
      ></il-button-icon>

      <il-button-icon
        .content=${IconNames.listBulleted}
        @click=${() => this.formatText("insertunorderedlist")}
        .tooltipText=${TooltipTexts.listBulleted}
      ></il-button-icon>

      <il-button-icon
        .content=${IconNames.listNumbered}
        @click=${() => this.formatText("insertorderedlist")}
        .tooltipText=${TooltipTexts.listNumbered}
      ></il-button-icon>

      <il-button-icon
        .content=${IconNames.undo}
        @click=${() => this.formatText("undo")}
        .tooltipText=${TooltipTexts.undo}
      ></il-button-icon>

      <il-button-icon
        .content=${IconNames.redo}
        @click=${() => this.formatText("redo")}
        .tooltipText=${TooltipTexts.redo}
      ></il-button-icon>
    `;
  }

  formatText(command) {
    document.execCommand(command, false);
    this.editor.value.focusEditor();
  }
}
customElements.define("il-editor-formatting-buttons", EditorFormattingButtons);
