import { LitElement, html, css } from "lit";

import "../../../components/button-icon";
import { IconNames } from "../../../enums/icon-names";

export class InsertionBar extends LitElement {
  static styles = css`
    div {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 1px;
      color: white;
    }
  `;

  render() {
    return html`
      <div @click=${this.select_formatting_option}>
        <il-button-icon content=${IconNames.pencil}></il-button-icon>
        <il-button-icon content=${IconNames.emoticon}></il-button-icon>
      </div>
    `;
  }

  select_formatting_option(e) {
    const option = e.target.content;
    this.dispatchEvent(
      new CustomEvent("open-insertion-mode", { detail: { 
        bEditor: (option === IconNames.pencil),
        bEmoji: (option === IconNames.emoticon)
      } }) 
    );
  }
}

customElements.define("il-insertion-bar", InsertionBar);
