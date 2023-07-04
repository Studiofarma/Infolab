import { LitElement, html, css } from "lit";
import { when } from "lit/directives/when.js";

import "./editor/editor-formatting-buttons";
import "../../../components/button-icon";

import { IconNames } from "../../../enums/icon-names";

import { TooltipTexts } from "../../../enums/tooltip-texts";

export class InsertionBar extends LitElement {
  static properties = {
    bEditor: false,
    editor: undefined,
  };

  static styles = css`
    div {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      color: white;
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
      color: white !important;
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
            @click=${this.emojiPickerClick}
            .content=${IconNames.emoticon}
            .tooltipText=${TooltipTexts.emoticon}
            .condition=${true}
          ></il-button-icon>

          <!-- <il-button-icon
            @click=${() => {
            this.bEditor = !this.bEditor;
            this.editor?.value.focusTextarea();
          }}
            .content=${IconNames.pencil}
            .tooltipText=${TooltipTexts.editor}
          ></il-button-icon>
          ${when(
            this.bEditor,
            () =>
              html`<il-editor-formatting-buttons
                .editor=${this.editor}
              ></il-editor-formatting-buttons>`
          )} -->
        </div>
        <div id="submitContainer">
          <il-button-icon
            @click=${this.sendMessage}
            .content=${IconNames.send}
            .tooltipText=${TooltipTexts.send}
          ></il-button-icon>
        </div>
      </div>
    `;
  }

  sendMessage() {
    this.dispatchEvent(new CustomEvent("send-message"));
  }

  emojiPickerClick() {
    this.dispatchEvent(new CustomEvent("emoji-picker-click"));
  }
}

customElements.define("il-insertion-bar", InsertionBar);
