import { LitElement, html, css } from "lit";
import { Picker } from "emoji-picker-element";

import "./insertion-bar";
import "./editor/editor";
import "../../../components/button-icon";
import "../../../components/input-field";

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
    this.picker = new Picker({
      emojiVersion: "14.0",
      dataSource:
        "https://cdn.jsdelivr.net/npm/emoji-picker-element-data@^1/en/emojibase/data.json",
      locale: "it",
      skinToneEmoji: "🖐️",
    });
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

    emoji-picker {
      width: 100%;
      height: 300px;
      --emoji-size: 15pt;
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
      padding: 20px 10px;
      background: #083c72;
      box-shadow: 0px -1px 5px black;
    }

    .inputContainer {
      display: flex;
      flex-grow: 1;
      padding: 5px;
      border-radius: 10px;
      transition: 0.5s;
      transition-delay: 1s;
      flex-wrap: wrap;
      align-items: center;
    }

    .inputContainer il-input-field[type="text"] {
      flex-grow: 1;
      border: none;
      outline: none;
      padding-left: 3px;
    }

    #submitContainer il-button-icon {
      width: 50px;
      height: 50px;
      margin-top: 0px;
      border: none;
      color: white !important;
      font-size: 20px;
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    il-editor {
      display: none;
      transition: 0.5s;
      height: 0px;
      overflow-y: hidden;
    }

    il-input-field[type="text"].closed {
      display: none;
    }

    il-input-field[type="text"].closed ~ il-editor {
      flex-grow: 1;
      width: calc(100% + 60px);
      height: 200px;
      display: block;
      overflow-x: hidden;
    }

    il-input-field {
      margin-right: 20px;
    }
  `;

  render() {
    return html`
      <div id="inputControls">
        <!-- .container is for emoji picker -->
        <div class="container">
          <div class="inputContainer">
            <il-insertion-bar
              @open-insertion-mode=${this.openInsertionMode}
              @click=${this.prova}
            >
            </il-insertion-bar>

            <il-input-field
              class=${this.bEditor ? "closed" : "opened"}
              type="text"
              placeholder="Scrivi un messaggio..."
              @keydown=${this.checkEnterKey}
              @mouseup=${this.setSelectedText}
              .value=${this.message}
            ></il-input-field>

            <il-editor
              @typing-text=${this.onInputFromEditor}
              @is-selecting=${this.onSelectionFromTextarea}
            ></il-editor>
          </div>
          <emoji-picker
            @emoji-click=${this.insertEmoji}
            ?hidden=${!this.bEmoji}
          ></emoji-picker>
        </div>

        <div id="submitContainer">
          <il-button-icon
            @click=${this.sendMessage}
            content="mdiSend"
          ></il-button-icon>
        </div>
      </div>
    `;
  }

  onInputFromEditor(e) {
    const markdownText = e.detail.content;
    this.renderRoot.querySelector("il-input-field").value = markdownText;
    this.updateMessage();
  }

  checkEnterKey(event) {
    if (event.key === "Enter") this.sendMessage();
  }

  getTextarea() {
    return (
      this.renderRoot
        .querySelector("il-editor")
        .shadowRoot.querySelector("textarea") ?? null
    );
  }

  getInputText() {
    return this.renderRoot.querySelector("il-input-field") ?? null;
  }

  openInsertionMode(e) {
    const option = e.detail.opt;
    if (option === "mdiPencil") {
      this.bEditor = !this.bEditor;
      this.updateMessage();
      this.getTextarea().value = this.message;
    } else if (option === "mdiEmoticon") this.bEmoji = !this.bEmoji;
  }

  sendMessage() {
    this.renderRoot.querySelector("il-input-field").clear();
    this.updateMessage();
    this.dispatchEvent(
      new CustomEvent("send-message", {
        detail: {
          message: this.message,
        },
      })
    );

    this.message = "";
    if (this.bEditor) {
      this.getTextarea().value = "";
      this.bEditor = false;
    }
  }

  //per Emoji
  setSelectedText() {
    const input = this.getInputText();
    this.selectedText = {
      startingPoint: input.selectionStart,
      endingPoint: input.selectionEnd,
    };
  }

  onSelectionFromTextarea(event) {
    this.selectedText = {
      startingPoint: event.detail.start,
      endingPoint: event.detail.end,
    };
  }

  insertEmoji(event) {
    const symbol = event.detail.unicode;

    if (this.selectedText !== null) {
      this.message =
        this.message.slice(0, this.selectedText.startingPoint) +
        symbol +
        this.message.slice(this.selectedText.endingPoint);
    } else {
      this.message = this.message + symbol;
    }

    if (this.bEditor) {
      this.renderRoot.querySelector("il-editor").message = this.message;
    }
    this.renderRoot.querySelector("il-input-field").value = this.message;
    this.selectedText = null;
  }

  updated(changed) {
    if (changed.has("message")) {
      this.getInputText().focus();
    }
  }

  updateMessage() {
    this.message = this.renderRoot.querySelector("il-input-field").value;
  }
}

customElements.define("il-input-controls", InputControls);
