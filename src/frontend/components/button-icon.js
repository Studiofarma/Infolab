import { LitElement, html, css, unsafeCSS } from "lit";
import { when } from "lit/directives/when.js";

import "./icon";
import "./tooltip";

export class ButtonIcon extends LitElement {
  static properties = {
    content: { type: String },
    color: { type: String },
    tooltipText: { type: String },
    condition: { type: Boolean },
  };

  static styles = css`
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
      color: #206cf7;
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
