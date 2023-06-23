import { LitElement, html, css } from "lit";

import "./insertion-bar";
import "./editor/editor";
import "../../../components/button-icon";
import "../../../components/input-field";
import "./emoji-picker";

export class InputControls extends LitElement {
  static properties = {
    message: "",
    bEditor: false,
    bEmoji: false,
    picker: {},
    selectedText: { startingPoint: NaN, endingPoint: NaN },
  };

  constructor() {
    super();
    this.message = "";
    this.bEditor = false;
    this.bEmoji = false;
    this.selectedText = null;
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
      bottom: 80px;
      left: 10px;
    }

    .emoji-picker-editor-opened {
      bottom: 265px;
    }

    #inputControls {
      position: fixed;
      bottom: 0px;
      left: 350px;
      width: calc(100% - 350px);
      min-height: 60px;
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 5px 10px;
      background: #083c72;
      border-top: 1px solid black;
      z-index: 1000;
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
    }

    il-editor {
      width: 100%;
    }
  `;

  render() {
    return html`
      <div id="inputControls">
        <!-- .container is for emoji picker -->
        <div class="container">
          <div class="inputContainer">
            <il-editor
              @enter-key-pressed=${this.sendMessage}
              @text-changed=${this.updateMessage}
              @text-editor-resized=${this.textEditorResized}
            ></il-editor>
            <il-insertion-bar
              @open-insertion-mode=${this.openInsertionMode}
              @click=${this.prova}
              @send-message=${this.sendMessage}
            >
            </il-insertion-bar>
          </div>
          <il-emoji-picker
            @emoji-click=${this.insertEmoji}
            ?hidden=${!this.bEmoji}
          ></il-emoji-picker>
        </div>
      </div>
    `;
  }

  checkEnterKey(event) {
    if (event.key === "Enter") this.sendMessage();
  }

  textEditorResized(event) {
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
