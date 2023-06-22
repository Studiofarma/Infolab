import { LitElement, html, css } from "lit";
import { resolveMarkdown } from "lit-markdown";

import "../../../../components/formatting-button";
import "../../../../components/button-text";

import { IconNames } from "../../../../enums/icon-names";
import { MarkdownService } from "../../../../services/markdown-services";
import { mdiFormatListText } from "@mdi/js";

export class Editor extends LitElement {
  static properties = {
    message: "",
    openPreview: mdiFormatListText,
    lastKeyPressed: "",
  };

  constructor() {
    super();
    this.message = "";
    this.openPreview = false;
    this.lastKeyPressed = "";
    this.Alt = "Alt";
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
      background: #0a478a;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 0px 10px;
      border-top: 1px solid rgb(97, 104, 112);
      border-right: 1px solid rgb(97, 104, 112);
      border-left: 1px solid rgb(97, 104, 112);
      border-radius: 6px 6px 0 0;
    }

    .buttons-container {
      width: 100%;
      display: flex;
      gap: 5px;
      margin-top: 8px;
    }

    .textarea-container {
      display: flex;
      justify-content: center;
      height: 69%;

      background-color: rgb(8 60 114);
      border: 1px solid #616870;
      border-radius: 0 0 5px 5px;
    }

    .text-area,
    .previewer {
      width: 99%;
      height: 91%;

      padding: 5px;

      border-radius: 5px;

      resize: none;
      overflow: auto;

      font-family: inherit;
      font-size: 12px;

      background: rgb(6, 43, 82);
      color: white;
    }

    .text-area {
      margin-top: 7px;
    }

    .text-area::placeholder {
      color: #ddd;
    }

    .previewer {
      background: #083c72;
      border: 1px solid transparent;
      margin-top: 6px;
    }

    .previewer > p {
      color: white;
      font-size: 12px;
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

    il-formatting-button {
      color: #c2c0c0;
    }

    .button-text {
      transform: translateY(1px);
    }
  `;

  render() {
    return html`
			<!-- diventerà un componente -->
			<div class="formatting-bar">
				<div class="buttons-container">
					<il-button-text
            @click=${() => this.setPreviewer(false)}
            class="button-text"
						text="Scrivi"
            styleProp=${
              this.openPreview
                ? "border: 1px solid transparent; background:none; transform: translateY(1px);"
                : ""
            }
					></il-button-text>
					<il-button-text
            @click=${() => this.setPreviewer(true)}
            class="button-text"
						text="Anteprima"
            styleProp=${
              this.openPreview
                ? ""
                : "border: 1px solid transparent; background: none; transform: translateY(1px);"
            }
					></il-button-text>
       </div>
						<il-formatting-button
							content=${IconNames.bold}
							@click=${this.insertBold}
						></il-formatting-button>

						<il-formatting-button
							content=${IconNames.italic}
							@click=${this.insertItalic}
						></il-formatting-button>

						<il-formatting-button
							content=${IconNames.strikethrough}
							@click=${this.insertStrike}
						></il-formatting-button>

						<il-formatting-button
							content=${IconNames.link}
							@click=${this.insertLink}
						></il-formatting-button>

						<il-formatting-button
							content=${IconNames.minus}
							@click=${this.insertLine}
						></il-formatting-button>

						<il-formatting-button
								content=${IconNames.listBulleted}
								@click=${this.insertListBulleted}
						></il-formatting-button>

							<il-formatting-button
								content=${IconNames.listNumbered}
								@click=${this.insertListNumbered}
						></il-formatting-button>
						
            <il-formatting-button
              content=${IconNames.title}
              @click=${this.insertHeading}
            ></il-formatting-button>

						
					</div>
          <div class="textarea-container">
					${
            !this.openPreview
              ? html`<textarea
                  class="text-area"
                  placeholder="Scrivi un messaggio..."
                  @input=${this.onMessageInput}
                  @keydown=${this.checkList}
                  .value=${this.message}
                >
                </textarea>`
              : html`<div class="previewer">
                  ${resolveMarkdown(
                    MarkdownService.parseMarkdown(this.message)
                  )}
                </div>`
          }
          </div>
				</div>
			</div>
		`;
  }

  onMessageInput(e) {
    const inputEl = e.target;
    this.message = inputEl.value;
  }

  setPreviewer(isOpened) {
    this.openPreview = isOpened;
  }

  checkList(event) {
    if (event.key === "Enter") {
      const rows = this.message.split("\n");
      let last_row = rows[rows.length - 1];
      const indexOfPoint = last_row.indexOf(".");

      if (last_row.startsWith("* ")) {
        this.message += "\n* ";
        event.preventDefault();
        return;
      }

      if (
        indexOfPoint != -1 &&
        !isNaN(parseInt(last_row.slice(0, indexOfPoint))) &&
        last_row.startsWith(". ", indexOfPoint)
      ) {
        this.message +=
          "\n" +
          (parseInt(last_row.slice(0, indexOfPoint)) + 1).toString() +
          ". ";
        event.preventDefault();
        return;
      }
    }

    let currentKeyPressed = event.key;

    this.applyMarkdown(this.lastKeyPressed, currentKeyPressed);

    this.lastKeyPressed = currentKeyPressed;
  }

  applyMarkdown(lastKeyPressed, currentKeyPressed) {
    if (lastKeyPressed === this.Alt && currentKeyPressed === "b") {
      this.insertBold();
      return;
    }
    if (lastKeyPressed === this.Alt && currentKeyPressed === "i") {
      this.insertItalic();
      return;
    }
    if (lastKeyPressed === this.Alt && currentKeyPressed === "s") {
      this.insertStrike();
      return;
    }
    if (lastKeyPressed === this.Alt && currentKeyPressed === "l") {
      this.insertLink();
      return;
    }
  }

  insertInTextArea(str) {
    let textarea = this.getTextarea();
    let start = textarea.selectionStart;
    let finish = textarea.selectionEnd;

    this.message =
      textarea.value.slice(0, start) + str + textarea.value.slice(finish);
    textarea.value = this.message;
  }

  //funzioni per formatting-buttons

  getText(text) {
    let sel = window.getSelection();
    const t = sel ? sel.toString() : "";
    if (t !== "") sel.deleteFromDocument();
    else t = text;
    return t;
  }

  insertBold() {
    const text = this.getText("grassetto");
    let regEx = /[*]{2}/g;
    if (text.startsWith("**") && text.endsWith("**"))
      this.insertInTextArea(text.replace(regEx, ""));
    else this.insertInTextArea("**" + text + "**");
  }

  insertItalic() {
    const text = this.getText("italic");
    let regEx = /[*]{1}/g;
    if (text.startsWith("*") && text.endsWith("*"))
      this.insertInTextArea(text.replace(regEx, ""));
    else this.insertInTextArea("*" + text + "*");
  }

  insertStrike() {
    const text = this.getText("barrato");
    let regEx = /[~]{2}/g;
    if (text.startsWith("~~") && text.endsWith("~~"))
      this.insertInTextArea(text.replace(regEx, ""));
    else this.insertInTextArea("~~" + text + "~~");
  }

  insertLink() {
    const text = this.getText("testo");
    let regEx = /[\[\]]+|(\(.*\))/g;
    if (text.startsWith("[") && text.includes("](") && text.endsWith(")"))
      this.insertInTextArea(text.replace(regEx, ""));
    else this.insertInTextArea("[" + text + "](insert link)");
  }

  insertLine() {
    this.insertInTextArea("\n - - - \n");
  }

  insertListBulleted() {
    const text = this.getText("punto");
    this.insertInTextArea("* " + text);
  }

  insertListNumbered() {
    const text = this.getText("punto");
    this.insertInTextArea("1. " + text);
  }

  insertHeading() {
    const text = this.getText("Titolo");
    this.insertInTextArea("### " + text);
  }

  getTextarea() {
    return this.renderRoot.querySelector("textarea") ?? null;
  }

  updated(changed) {
    if (changed.has("message")) {
      this.dispatchEvent(
        new CustomEvent("typing-text", { detail: { content: this.message } })
      );
      this.getTextarea().focus();
    }
  }
}
customElements.define("il-editor", Editor);
