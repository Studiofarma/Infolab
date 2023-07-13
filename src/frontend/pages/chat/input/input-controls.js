import { LitElement, html, css } from "lit";
import { createRef, ref } from "lit/directives/ref.js";

import { ThemeColorService } from "../../../services/theme-color-service";

import { ThemeCSSVariables } from "../../../enums/theme-css-variables";

import "./insertion-bar";
import "./editor/editor";
import "../../../components/button-icon";
import "../../../components/input-field";
import "./emoji-picker";

const emojiPickerBottomOffset = 90;
const enterKey = "Enter";

export class InputControls extends LitElement {
  static properties = {
    message: "",
    isEmojiPickerOpen: false,
    picker: {},
    selectedText: { startingPoint: NaN, endingPoint: NaN },
    isEditing: { type: Boolean },
    messageBeingEdited: { type: Object },
    indexBeingEdited: { type: Number },
  };

  constructor() {
    super();
    this.message = "";
    this.isEmojiPickerOpen = false;
    this.selectedText = null;
    this.isEditorInEditMode = false;

    // Refs
    this.editorRef = createRef();
    this.emojiPickerRef = createRef();
  }

  static styles = css`
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      ${ThemeColorService.getThemeVariables()};
    }

    .container {
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      gap: 10px;
    }

    il-emoji-picker {
      position: absolute;
      left: 10px;
      bottom: 120px;
    }

    #inputControls {
      position: fixed;
      bottom: 0px;
      left: 350px;
      width: calc(100% - 390px);
      min-height: 60px;
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 5px 5px;
      background: ${ThemeCSSVariables.inputControlsBg};
      box-shadow: 0 0 8px 2px ${ThemeCSSVariables.boxShadowPrimary};
      margin: 0 20px;
      z-index: 1000;
      border-radius: 10px 10px 0 0;
    }

    .inputContainer {
      display: flex;
      flex-grow: 1;
      padding: 5px;
      border-radius: 10px;
      transition: 0.5s;
      transition-delay: 1s;
      flex-wrap: wrap;
      justify-content: center;
      flex-direction: column;
      z-index: 10000;
    }

    il-editor {
      background-color: ${ThemeCSSVariables.editorBg};
      border-radius: 10px;
    }
  `;

  render() {
    return html`
      <div id="inputControls">
        <!-- .container is for emoji picker -->
        <div class="container">
          <div class="inputContainer">
            <il-editor
              ${ref(this.editorRef)}
              @il:enter-key-pressed=${this.handleEnterKey}
              @il:text-changed=${this.updateMessage}
              @il:text-editor-resized=${this.handleTextEditorResized}
              .isEditMode=${this.isEditorInEditMode}
            ></il-editor>
            <il-insertion-bar
              @il:message-sent=${this.sendMessage}
              @il:emoji-picker-clicked=${this.handleEmojiPickerClick}
              @il:edit-confirmed=${this.confirmEdit}
              @il:edit-canceled=${this.handleEditCanceled}
              @il:editor-mode-changed=${this.changeEditorMode}
              .editor=${this.editorRef}
              .isEditing=${this.isEditing}
            >
            </il-insertion-bar>
          </div>
          <il-emoji-picker
            ${ref(this.emojiPickerRef)}
            @emoji-click=${this.insertEmoji}
            @il:emoji-picker-closed=${() => (this.isEmojiPickerOpen = false)}
            ?isOpen=${this.isEmojiPickerOpen}
            class="emoji-picker-editor-opened"
          ></il-emoji-picker>
        </div>
      </div>
    `;
  }

  clearMessage() {
    this.message = "";
    this.editorRef.value?.clearMessage();
  }

  focusEditor() {
    this.editorRef.value.focusEditor();
  }

  insertEmoji(event) {
    this.editorRef.value.insertInEditor(event.detail.unicode);
  }

  checkEnterKey(event) {
    if (event.key === enterKey) this.sendMessage();
  }

  handleEmojiPickerClick() {
    this.isEmojiPickerOpen = !this.isEmojiPickerOpen;
    this.editorRef.value.focusEditor();
  }

  handleTextEditorResized(event) {
    this.emojiPickerRef.value.style.bottom = `${
      event.detail.height + emojiPickerBottomOffset
    }px`;

    this.dispatchEvent(new CustomEvent(event.type, { detail: event.detail }));
  }

  sendMessage() {
    this.dispatchEvent(
      new CustomEvent("il:message-sent", {
        detail: {
          message: this.message,
        },
      })
    );
    this.clearMessage();
  }

  handleEnterKey() {
    if (this.isEditing) {
      this.confirmEdit(new CustomEvent("il:edit-confirmed"));
    } else {
      this.sendMessage();
    }
  }

  updateMessage(event) {
    this.message = event.detail.content;
  }

  editMessage(detail) {
    this.editorRef.value?.setEditorText(detail.message.content);
    this.isEditing = true;
    this.messageBeingEdited = detail.message;
    this.indexBeingEdited = detail.messageIndex;
    this.focusEditor();
  }

  changeEditorMode(event) {
    this.isEditorInEditMode = event.detail.isOpen;
    this.requestUpdate();
  }

  confirmEdit(event) {
    this.messageBeingEdited.content = this.editorRef.value?.getText();

    this.dispatchEvent(
      new CustomEvent(event.type, {
        detail: {
          message: this.messageBeingEdited,
          index: this.indexBeingEdited,
        },
      })
    );
    this.isEditing = false;
    this.messageBeingEdited = {};
    this.indexBeingEdited = undefined;
    this.clearMessage();
    this.focusEditor();
  }

  handleEditCanceled() {
    this.isEditing = false;
    this.messageBeingEdited = {};
    this.indexBeingEdited = undefined;
    this.clearMessage();
    this.focusEditor();
  }
}

customElements.define("il-input-controls", InputControls);
