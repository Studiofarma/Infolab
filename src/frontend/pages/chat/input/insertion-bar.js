import { LitElement, html, css } from "lit";

import "../../../components/button-icon";
import "./editor/editor-formatting-buttons";

import { IconNames } from "../../../enums/icon-names";

export class InsertionBar extends LitElement {
  static properties = {
    bEditor: false,
  };

  static styles = css`
    div {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      color: white;
    }
    .formatting-container {
      justify-content: left;
      gap: 1px;
    }

    il-editor-formatting-buttons {
      display: flex;
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
  `;

  render() {
    return html`
      <div @click=${this.select_formatting_option}>
        <div class="formatting-container">
          <il-button-icon content=${IconNames.emoticon}></il-button-icon>
          <il-button-icon
            content=${IconNames.pencil}
            @click=${() => (this.bEditor = !this.bEditor)}
          ></il-button-icon>
          ${this.bEditor
            ? html`<il-editor-formatting-buttons></il-editor-formatting-buttons>`
            : ""}
        </div>
        <div id="submitContainer">
          <il-button-icon
            @click=${this.sendMessage}
            content=${IconNames.send}
          ></il-button-icon>
        </div>
      </div>
    `;
  }

  sendMessage() {
    this.dispatchEvent(new CustomEvent("send-message"));
  }

  select_formatting_option(e) {
    const option = e.target.content;
    this.dispatchEvent(
      new CustomEvent("open-insertion-mode", {
        detail: {
          bEmoji: option === IconNames.emoticon,
        },
      })
    );
  }
}

customElements.define("il-insertion-bar", InsertionBar);
