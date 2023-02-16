import { LitElement, html, css } from "lit";

import "./formatting-button.js";
export class Editor extends LitElement {
  static properties = {
    message: "",
    activeOptions: [],
  };

  static styles = css`
    * {
      box-sizing: border-box;
      padding: 0;
      margin: 0;
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
      border-radius: 10pt;
      outline: none;
      padding: 5px;
      resize: none;
      overflow-y: auto;
      font-family: inherit;
    }

    select {
      border: none;
      outline: none;
      min-width: 80px;
      padding: 5px;
    }
  `;

  render() {
    return html`
      <!-- diventerà un componente -->
      <div class="formatting-bar">
        <il-formatting-button content="B"></il-formatting-button>
        <il-formatting-button content="I"></il-formatting-button>
        <il-formatting-button content="S"></il-formatting-button>
        <il-formatting-button content="list"></il-formatting-button>
        <il-formatting-button content="link"></il-formatting-button>

        <select>
          <option><h1>h1</h1></option>
          <option><h2>h2</h2></option>
          <option><h3>h3</h3></option>
        </select>
      </div>

      <textarea
        placeholder="Scrivi un messaggio..."
        @input=${this.onMessageInput}
      ></textarea>
    `;
  }

  onMessageInput(e) {
    const inputEl = e.target;
    this.message = inputEl.value;

    this.dispatchEvent(
      new CustomEvent("typing-text", { detail: { content: this.message } })
    );
  }
}
customElements.define("il-editor", Editor);
