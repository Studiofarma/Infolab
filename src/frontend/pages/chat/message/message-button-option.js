import { LitElement, html, css, adoptStyles } from "lit";

import { ThemeColorService } from "../../../services/theme-color-service";

import { ThemeCSSVariables } from "../../../enums/theme-css-variables";

import "../../../components/icon";

import { ElementMixin } from "../../../models/element-mixin";

export class MessageButtonOption extends ElementMixin(LitElement) {
  static properties = {
    iconName: { type: String },
    text: { type: String },
  };

  static styles = css`
    * {
      ${ThemeColorService.getThemeVariables()};
    }

    div {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 2px 4px;
      cursor: pointer;
      white-space: nowrap;
      overflow: hidden;
      transition: background 0.5s;
      background-color: ${ThemeCSSVariables.messageMenuBg};
      color: ${ThemeCSSVariables.actionText};
    }

    div:hover {
      background-color: ${ThemeCSSVariables.messageMenuBgHover};
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

customElements.define("il-message-button-option", MessageButtonOption);
