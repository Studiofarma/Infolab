import { LitElement, html, css } from "lit";

import "../../components/button-icon";
import "../../components/insertion-bar";
import "../../components/editor";
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
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    input {
      font-family: inherit;
    }

    #inputControls {
      position: absolute;
      bottom: 0px;
      left: 0px;
      width: 100%;
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
      background: white;
      padding: 5px;
      border-radius: 10px;
      transition: 0.5s;
      transition-delay: 1s;
    }

    .inputContainer input[type="text"] {
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

    input[type="text"].closed {
      display: none;
    }

    input[type="text"].closed ~ il-editor {
      flex-grow: 1;
      width: calc(100% + 60px);
      height: 200px;
      display: block;
    }
  `;

  render() {
    return html`
      <div id="inputControls">
        <div class="inputContainer">
          <il-insertion-bar
            @open-insertion-mode=${this.openInsertionMode}
            @click=${this.prova}
          >
          </il-insertion-bar>

          <input
            class=${this.bEditor ? "closed" : "opened"}
            type="text"
            placeholder="Scrivi un messaggio..."
            @input=${this.onMessageInput}
            @keydown=${this.checkEnterKey}
            .value=${this.message}
          />

          <il-editor @typing-text=${this.onInputFromEditor}></il-editor>
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
    const markdownText = e.detail.content;
    this.message = markdownText;
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
