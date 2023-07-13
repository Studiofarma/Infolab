import { LitElement, html, css } from "lit";
import { when } from "lit/directives/when.js";

import "../../../components/button-icon";
import "./editor/editor-formatting-buttons";

import { IconNames } from "../../../enums/icon-names";
import { TooltipTexts } from "../../../enums/tooltip-texts";

export class InsertionBar extends LitElement {
  static properties = {
    areFormattingButtonsOpen: false,
    editor: undefined,
    isEditing: { type: Boolean },
  };

  static styles = css`
    div {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
    }

    .formatting-container {
      justify-content: left;
      gap: 1px;
    }

    il-editor-formatting-buttons {
      display: flex;
    }

    #submitContainer il-button-icon {
      width: 50px;
      height: 50px;
      margin-top: 0px;
      border: none;
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  `;

  render() {
    return html`
      <div>
        <div class="formatting-container">
          <il-button-icon
            .content=${IconNames.emoticon}
            @click=${this.emojiPickerClick}
            .tooltipText=${TooltipTexts.emoticon}
          ></il-button-icon>
          <il-button-icon
            .content=${IconNames.pencil}
            .tooltipText=${TooltipTexts.editor}
            @click=${this.toggleFormattingButtons}
          ></il-button-icon>
          ${when(
            this.areFormattingButtonsOpen,
            () =>
              html`<il-editor-formatting-buttons
                .editor=${this.editor}
              ></il-editor-formatting-buttons>`
          )}
        </div>
        <div id="submitContainer">
          ${when(
            this.isEditing,
            () => html`
              <il-button-icon
                @click=${this.cancelEdit}
                content=${IconNames.close}
                .tooltipText=${TooltipTexts.discardChanges}
              ></il-button-icon>

              <il-button-icon
                @click=${this.confirmEdit}
                content=${IconNames.check}
                .tooltipText=${TooltipTexts.confirmChanges}
              ></il-button-icon>
            `,
            () => html`
              <il-button-icon
                @click=${this.sendMessage}
                content=${IconNames.send}
                .tooltipText=${TooltipTexts.send}
              ></il-button-icon>
            `
          )}
        </div>
      </div>
    `;
  }

  toggleFormattingButtons() {
    this.areFormattingButtonsOpen = !this.areFormattingButtonsOpen;
    this.editor?.value.focusEditor();

    this.dispatchEvent(
      new CustomEvent("il:editor-mode-changed", {
        detail: { isOpen: this.areFormattingButtonsOpen },
      })
    );
  }

  sendMessage() {
    this.dispatchEvent(new CustomEvent("il:message-sent"));
  }

  emojiPickerClick() {
    this.dispatchEvent(new CustomEvent("il:emoji-picker-clicked"));
  }

  confirmEdit() {
    this.dispatchEvent(new CustomEvent("il:edit-confirmed"));
  }

  cancelEdit() {
    this.dispatchEvent(new CustomEvent("il:edit-canceled"));
  }
}

customElements.define("il-insertion-bar", InsertionBar);
