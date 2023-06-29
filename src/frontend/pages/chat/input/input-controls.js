import { LitElement, html, css } from "lit";
import { createRef, ref } from "lit/directives/ref.js";

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
  };

  constructor() {
    super();
    this.message = "";
    this.isEmojiPickerOpen = false;
    this.selectedText = null;
    this.editorRef = createRef();
  }

  static styles = css`
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
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
      background: #f2f4f7;
      box-shadow: 0 0 8px 2px #b7b9bd;
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
      background-color: #eaecef;
      border-radius: 10px;
    }

    hr {
      height: 4px;
      background-color: #206cf7;
      border: 0;
      border-radius: 5px;
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
              @enter-key-pressed=${this.sendMessage}
              @text-changed=${this.updateMessage}
              @text-editor-resized=${this.textEditorResized}
            ></il-editor>
            <il-insertion-bar
              @send-message=${this.sendMessage}
              @emoji-picker-click=${this.emojiPickerClick}
              .editor=${this.editorRef}
            >
            </il-insertion-bar>
          </div>
          <il-emoji-picker
            @emoji-click=${this.insertEmoji}
            @picker-close=${() => (this.isEmojiPickerOpen = false)}
            ?isOpen=${this.isEmojiPickerOpen}
            class="emoji-picker-editor-opened"
          ></il-emoji-picker>
        </div>
      </div>
    `;
  }

  focusEditor() {
    this.editorRef.value.focusEditor();
  }

  insertEmoji(event) {
    this.editorRef.value.insertInTextarea(event.detail.unicode);
  }

  checkEnterKey(event) {
    if (event.key === enterKey) this.sendMessage();
  }

  emojiPickerClick() {
    this.isEmojiPickerOpen = !this.isEmojiPickerOpen;
    this.editorRef.value.focusEditor();
  }

  textEditorResized(event) {
    const emojiPicker = this.shadowRoot.querySelector("il-emoji-picker");
    emojiPicker.style.bottom = `${
      event.detail.height + emojiPickerBottomOffset
    }px`;

    this.dispatchEvent(
      new CustomEvent("text-editor-resized", { detail: event.detail })
    );
  }

  sendMessage() {
    this.dispatchEvent(
      new CustomEvent("send-message", {
        detail: {
          message: this.message,
        },
      })
    );
    this.message = "";
    this.shadowRoot.querySelector("il-editor").clearMessage();
  }

  updateMessage(event) {
    this.message = event.detail.content;
  }
}

customElements.define("il-input-controls", InputControls);
