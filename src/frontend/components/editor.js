import { LitElement, html, css } from "lit";
import { resolveMarkdown } from "lit-markdown";

import "./formatting-button.js";

//da markdown a html
export function parseMarkdown(text) {
  const md = require("markdown-it")({
    html: false,
    linkify: true,
  });

  const output =
    text === "" ? "Niente da visualizzare" : md.render(text.trim());
  return output;
}

export class Editor extends LitElement {
  static properties = {
    message: "",
    openPreview: false,
    selectedText: "",
  };

  constructor() {
    super();
    this.message = "";
    this.openPreview = false;
    this.selectedText = "";
  }

  static styles = css`
    * {
      box-sizing: border-box;
      padding: 0;
      margin: 0;
    }

    ul,
    ol {
      list-style-position: inside;
    }

    .formatting-bar {
      width: 100%;
      height: 40px;
      background: #bcc7d9;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 0px 10px;
    }

    textarea {
      width: 100%;
      height: 100%;
      border: none;
      outline: none;
      padding: 5px;
      resize: none;
      overflow-y: auto;
      font-family: inherit;
    }

    div[class*="select-"] {
      position: relative;
      width: max-content;
    }

    div[class*="select-"] .dropdown {
      overflow: hidden;
      max-height: 0px;
      transition: 0.5s;
      position: absolute;
      top: 30px;
      left: 0px;
      min-width: 100px;
      background: #bcc7d9;
      z-index: 10;
    }

    div[class*="select-"]:hover .dropdown {
      overflow-y: auto;
      max-height: 100px;
      padding: 10px 8px;
    }

    .dropdown::-webkit-scrollbar {
      width: 3px;
      background: #677fa5;
    }

    .dropdown::-webkit-scrollbar-thumb {
      background: #507cc4;
    }

    .dropdown .option {
      cursor: pointer;
      transition: 0.5s;
      padding: 2px;
      display: flex;
      align-items: center;
      white-space: nowrap;
    }

    .dropdown .option:hover {
      background: #9faec5;
    }

    .dropdown input[type="radio"] {
      display: block;
      margin-left: 25px;
    }

    #preview_btn {
      margin-left: auto;
      padding: 5px 10px;
      background: white;
      min-width: 80px;
      text-align: center;
      border: none;
      outline: none;
      font-weight: bold;
      cursor: pointer;
    }

    .previewer {
      padding: 10px;
      width: 100%;
      min-height: calc(100% - 40px);
      overflow-y: auto;
    }
  `;

  render() {
    return html`
      <!-- diventerà un componente -->
      <div class="formatting-bar" @click=${this.insertMarkdown}>
        <il-formatting-button content="format_bold"></il-formatting-button>
        <il-formatting-button content="format_italic"></il-formatting-button>
        <il-formatting-button content="strikethrough_s"></il-formatting-button>
        <il-formatting-button content="link"></il-formatting-button>

        <div class="select-list">
          <il-formatting-button content="list_alt"></il-formatting-button>
          <div class="dropdown">
            <div class="option">
              <label for="disc">
                <ul>
                  <li>example</li>
                  <li>example</li>
                  <li>example</li>
                </ul>
              </label>
              <input type="radio" name="forList" id="disc" checked />
            </div>

            <div class="option">
              <label for="number">
                <ol>
                  <li>example</li>
                  <li>example</li>
                  <li>example</li>
                </ol>
              </label>
              <input type="radio" name="forList" id="number" />
            </div>
          </div>
        </div>

        <div class="select-heading">
          <il-formatting-button content="title"></il-formatting-button>
          <div class="dropdown">
            <div class="option">
              <label for="h1">
                <h1>Titolo 1</h1>
              </label>
              <input type="radio" name="forHeading" id="h1" checked />
            </div>
            <div class="option">
              <label for="h2">
                <h1>Titolo 2</h1>
              </label>
              <input type="radio" name="forHeading" id="h2" />
            </div>
            <div class="option">
              <label for="h3">
                <h1>Titolo 3</h1>
              </label>
              <input type="radio" name="forHeading" id="h3" />
            </div>
          </div>
        </div>

        <button id="preview_btn" @click=${this.togglePreviewer}>preview</button>
      </div>

      ${!this.openPreview
        ? html`<textarea
            placeholder="Scrivi un messaggio..."
            @input=${this.onMessageInput}
            @mouseup=${this.setSelectedText}
            .value=${this.message}
          >
          </textarea>`
        : html`<div class="previewer">
            ${resolveMarkdown(parseMarkdown(this.message))}
          </div>`}
    `;
  }

  onMessageInput(e) {
    const inputEl = e.target;
    this.message = inputEl.value;

    this.dispatchEvent(
      new CustomEvent("typing-text", { detail: { content: this.message } })
    );
  }

  togglePreviewer() {
    this.openPreview = !this.openPreview;
  }

  setSelectedText() {
    this.selectedText = window.getSelection().toString();
  }

  insertInTextArea(str, symbol) {
    if (this.selectedText !== "") {
      this.message = this.message.replace(this.selectedText, str);
    } else {
      this.message = this.message + str;
    }
    this.selectedText = "";
  }

  insertMarkdown(event) {
    console.log(event.target);

    if (event.target.content === "format_bold") {
      this.insertInTextArea("**grassetto**");
      return;
    }

    if (event.target.content === "format_italic") {
      this.insertInTextArea("*italic*");
      return;
    }

    if (event.target.content === "strikethrough_s") {
      this.insertInTextArea("~~barrato~~");
      return;
    }

    if (event.target.content === "link") {
      this.insertInTextArea("[testo](link)");
      return;
    }

    if (event.target.content === "list_alt") {
      this.insertInTextArea(this.getTypeOfList());
      return;
    }

    if (event.target.content === "title") {
      this.insertInTextArea(this.getTypeOfHeading());
      return;
    }
  }

  getTypeOfList() {
    const checkedList =
      this.renderRoot.querySelector(`input[name="forList"]:checked`) ?? null;

    if (checkedList.id === "disc") return "* punto";

    if (checkedList.id === "number") return "1. punto";
  }

  getTypeOfHeading() {
    const checkedHeading =
      this.renderRoot.querySelector(`input[name="forHeading"]:checked`) ?? null;

    if (checkedHeading.id === "h1") return "# Titolo1";
    if (checkedHeading.id === "h2") return "## Titolo2";
    if (checkedHeading.id === "h3") return "### Titolo3";
  }

  getTextarea() {
    return this.renderRoot.querySelector("textarea") ?? null;
  }

  updated(changed) {
    if (changed.has("message")) this.getTextarea().focus();
  }
}
customElements.define("il-editor", Editor);
