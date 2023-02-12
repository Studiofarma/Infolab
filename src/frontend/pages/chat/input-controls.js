import { LitElement, html, css } from "lit";

import "../../components/button-icon";
import "../../components/insertion-bar";
import "../../components/editor";

import { resolveMarkdown } from "lit-markdown";

export class InputControls extends LitElement {
  static properties = {
    message: "",
    bEditor: false,
    bEmoji: false,
  };

  constructor() {
    super();
    this.message = "";
    this.bEditor = false;
    this.bEmoji = false;
  }

  static styles = css`
    #inputControls {
      position: absolute;
      bottom: 0px;
      left: 0px;
      width: 100%;
      min-height: 60px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 5px;
      padding: 8px 0;
      background: #0074bc;
    }

    #inputControls input[type="text"] {
      height: 30px;
      border-radius: 10px;
      padding: 5px 12px;
      font-size: 15pt;
      border: none;
      outline: none;
      margin-left: 10px;
      transition: all 0.5s;
    }

    #inputControls input[type="text"].editor-mode {
      height: 60px;
    }

    #inputControls > * {
      flex-shrink: 1;
      width: 100%;
    }

    #inputControls #submitContainer {
      flex-basis: 10%;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    #inputControls .inputContainer {
      position: relative;
      display: flex;
      flex-direction: column;
      gap: 5px;
      height: auto;
      padding-left: 10px;
    }

    #submitContainer il-button-icon {
      width: 40px;
      height: 40px;
      margin-top: 0px;
      border: none;
      border-radius: 50%;
      background: white;
      font-size: 20px;
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
      color: black;
    }

    input {
      font-family: inherit;
    }
  `;

  render() {
    return html`
      <div id="inputControls">
        <div class="inputContainer">
          <input
            ?hidden=${this.bEditor}
            type="text"
            placeholder="Scrivi un messaggio..."
            @input=${this.onMessageInput}
            @keydown=${this.checkEnterKey}
            .value=${this.message}
          />

          <il-editor
            ?hidden=${!this.bEditor}
            @typing-text=${this.onInputFromEditor}
          ></il-editor>

          <il-insertion-bar @open-insertion-mode=${this.openInsertionMode}>
          </il-insertion-bar>
        </div>

        <div id="submitContainer">
          <il-button-icon
            @click=${this.sendMessage}
            content="send"
          ></il-button-icon>
        </div>
      </div>
    `;
  }

  onInputFromEditor(e) {
    const htmlOutput = e.detail.content;
    this.message = htmlOutput;
  }

  onMessageInput(e) {
    const inputEl = e.target;
    this.message = inputEl.value;
  }

  checkEnterKey(event) {
    if (event.key === "Enter") this.sendMessage();
  }

  openInsertionMode(e) {
    const option = e.detail.opt;
    if (option === "edit") this.bEditor = !this.bEditor;
    else if (option === "mood") this.bEmoji = !this.bEmoji;
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
    if (this.bEditor) {
      this.bEditor = false;
    }
  }
}

customElements.define("il-input-controls", InputControls);
