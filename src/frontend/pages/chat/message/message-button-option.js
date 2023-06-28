import { LitElement, html, css } from "lit";

import "../../../components/icon";

export class MessageButtonOption extends LitElement {
  static properties = {
    iconName: { type: String },
    text: { type: String },
  };

  static styles = css`
    div {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 2px 4px;
      cursor: pointer;
      white-space: nowrap;
      transition: background 0.5s;
    }

    div:hover {
      background-color: #dfd8d8;
    }
  `;

  render() {
    return html`
      <div>
        <il-icon name=${this.iconName}></il-icon>
        ${this.text}
      </div>
    `;
  }
}

customElements.define("message-button-option", MessageButtonOption);
