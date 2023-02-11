import { LitElement, html, css } from "lit";

import "../components/button-icon";

export class InsertionBar extends LitElement {
  static styles = css`
    div {
      display: flex;
      align-items: center;
      gap: 10px;
      padding-left: 10px;
    }

    il-button-icon {
      color: white;
    }
  `;

  render() {
    return html`
      <div @click=${this.select_formatting_option}>
        <il-button-icon content="edit"></il-button-icon>
        <il-button-icon content="mood"></il-button-icon>
      </div>
    `;
  }

  select_formatting_option(e) {
    const option = e.target.content;
    this.dispatchEvent(
      new CustomEvent("open-editor", { detail: { opt: option } })
    );
  }
}

customElements.define("il-insertion-bar", InsertionBar);
