import { LitElement, html, css } from "lit";
import { Picker } from "emoji-picker-element";

import "./insertion-bar";
import "./editor/editor";
import "../../../components/button-icon";
import "../../../components/input-field";

import { IconNames } from "../../../enums/icon-names";

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
            ></il-editor>
            <il-insertion-bar
              @open-insertion-mode=${this.openInsertionMode}
              @click=${this.prova}
              @send-message=${this.sendMessage}
            >
            </il-insertion-bar>
          </div>
          <emoji-picker
            @emoji-click=${this.insertEmoji}
            ?hidden=${!this.bEmoji}
          ></emoji-picker>
        </div>
      </div>
    `;
  }

  checkEnterKey(event) {
    if (event.key === "Enter") this.sendMessage();
  }

  openInsertionMode(e) {
    if (e.detail.bEmoji) this.bEmoji = !this.bEmoji;

    this.dispatchEvent(
      new CustomEvent(e.type, {
        detail: {
          bEmoji: this.bEmoji,
        },
      })
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
