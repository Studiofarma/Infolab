import { LitElement, html, css } from "lit";
import { resolveMarkdown } from "lit-markdown";

import "./formatting-button.js";

//da markdown a html
export function parseMarkdown(text) {
  const md = require("markdown-it")({
    html: false,
    breaks: true,
    linkify: true,
  });

  const output = md.render(text.trim());
  return output;
}

export class Editor extends LitElement {
  static properties = {
    message: "",
    openPreview: false,
  };

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

    ::marker {
      color: darkblue;
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
      justify-content: center;
      align-items: center;
      white-space: nowrap;
    }

    .dropdown .option:hover {
      background: #9faec5;
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
              <ul>
                <li>example</li>
                <li>example</li>
                <li>example</li>
              </ul>
            </div>

            <div class="option">
              <ol>
                <li>example</li>
                <li>example</li>
                <li>example</li>
              </ol>
            </div>
          </div>
        </div>

        <div class="select-heading">
          <il-formatting-button content="title"></il-formatting-button>
          <div class="dropdown">
            <div class="option"><h1>Titolo 1</h1></div>
            <div class="option"><h2>Titolo 2</h2></div>
            <div class="option"><h3>Titolo 3</h3></div>
          </div>
        </div>

        <button id="preview_btn" @click=${this.togglePreviewer}>preview</button>
      </div>

      ${!this.openPreview
        ? html`<textarea
            placeholder="Scrivi un messaggio..."
            @input=${this.onMessageInput}
          >
 ${this.message} </textarea
          >`
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

  insertMarkdown(event) {
    if (this.message === undefined) this.message = "";

    console.log(event.target);
    if (!this.openPreview) {
      if (event.target.content === "B") {
        this.message += " **grassetto**";
        return;
      }

      if (event.target.content === "I") {
        this.message += " *corsivo*";
        return;
      }

      if (event.target.content === "S") {
        this.message += " ~~barrato~~";
        return;
      }

      if (event.target.content === "link") {
        this.message += " [testo](link)";
        return;
      }

      // DA SISTEMARE
      // if (event.target.classList.contains("option")) {
      //   const option = event.target.textContent;

      //   if (option === "point") this.message += "\n * punto ";
      //   else if (option === "number") this.message += "\n 1. ";
      //   else if (option === "h1") this.message += "# titolo1";
      //   else if (option === "h2") this.message += "## titolo2";
      //   else if (option === "h3") this.message += "### titolo3";

      //   return;
      // }
    }
  }
}
customElements.define("il-editor", Editor);
