import { LitElement, html, css } from "lit";

import "../components/button-icon";

export class InsertionBar extends LitElement {
  static styles = css`
    div {
      display: flex;
      align-items: center;
      gap: 1px;
    }
  `;

  render() {
    return html`
      <div @click=${this.select_formatting_option}>
        <il-button-icon content="mdiPencil"></il-button-icon>
        <il-button-icon content="mdiEmoticon"></il-button-icon>
      </div>
    `;
  }

  select_formatting_option(e) {
    const option = e.target.content;
    this.dispatchEvent(
      new CustomEvent("open-insertion-mode", { detail: { opt: option } })
    );
  }
}

customElements.define("il-insertion-bar", InsertionBar);
