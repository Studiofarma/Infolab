import { html, css, unsafeCSS } from "lit";
import { when } from "lit/directives/when.js";

import { ThemeColorService } from "../services/theme-color-service";

import { ThemeCSSVariables } from "../enums/theme-css-variables";

import "./icon";
import "./tooltip";

import { BaseComponent } from "./base-component";
export class ButtonIcon extends BaseComponent {
  static properties = {
    content: { type: String },
    color: { type: String },
    tooltipText: { type: String },
    condition: { type: Boolean },
  };

  static styles = css`
    * {
      ${ThemeColorService.getThemeVariables()};
    }

    :host {
      display: flex;
      align-items: center;
    }

    .icon-button {
      height: 100%;
      width: 100%;
      font-size: 0px;
      -webkit-font-smoothing: antialiased;
      cursor: pointer;
      user-select: none;
      padding: 5px;
      color: ${ThemeCSSVariables.iconColor};
    }

    .contanier {
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: inherit;
      border-radius: inherit;
    }
  `;

  render() {
    return html`
      <div class="container">
        <div class="icon-button" .style="color: ${unsafeCSS(this.color)}">
          <il-icon name="${this.content}"></il-icon>
        </div>
        ${when(
          this.tooltipText && (this.condition === undefined || this.condition),
          () => html`<il-tooltip>${this.tooltipText}</il-tooltip>`,
          () => html``
        )}
      </div>
    `;
  }
}

customElements.define("il-button-icon", ButtonIcon);
