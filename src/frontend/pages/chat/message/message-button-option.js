import { LitElement, html, css } from "lit";

import {ThemeColorService} from "../../../services/theme-color-service"

import "../../../components/icon";

const layoutID = "message"

export class MessageButtonOption extends LitElement {
  static properties = {
    iconName: { type: String },
    text: { type: String },
  };

  static styles = css`

  * {
    ${ThemeColorService.applyStyle(layoutID)}
  }

    div {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 2px 4px;
      cursor: pointer;
      white-space: nowrap;
      transition: background 0.5s;
      color: var(--actionText);
    }

    div:hover {
      background-color: var(--messageMenuBgHover);
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
