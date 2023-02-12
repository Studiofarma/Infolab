import { LitElement, html, css } from "lit";

import "./formatting-bar";

import { resolveMarkdown } from "lit-markdown";

export class Editor extends LitElement {
  static properties = {
    message: "",
    activeOptions: [],
  };

  static styles = css`
    .container {
      position: relative;
      overflow: hidden;
    }

    textarea {
      width: 100%;
      height: 200px;
      border: none;
      outline: none;
      padding: 5px;
      margin-left: 15px;
      resize: none;
    }

    il-formatting-bar {
      width: 100%;
      height: 30px;
    }
  `;

  render() {
    return html`
      <div class="container">
        <il-formatting-bar></il-formatting-bar>
        <textarea
          placeholder="Scrivi un messaggio..."
          @input=${this.parseMarkdown}
        ></textarea>
      </div>
    `;
  }

  parseMarkdown(e) {
    const inputEl = e.target;
    this.message = inputEl.value;

    const md = require("markdown-it")({
      html: false,
      linkify: true,
    });

    const output = md.renderInline(this.message);

    this.dispatchEvent(
      new CustomEvent("typing-text", { detail: { content: output } })
    );
  }
}
customElements.define("il-editor", Editor);
