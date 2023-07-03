import { LitElement, css, html } from "lit";

import "./button-icon";
import "./tooltip";

export class ButtonIconWithTooltip extends LitElement {
  static properties = {
    content: { type: String },
    tooltipText: { type: String },
    condition: { type: Boolean },
  };

  static styles = css`
    div {
      background-color: inherit;
      box-shadow: inherit;
      border-radius: inherit;
    }
  `;

  render() {
    return html`<div>
      <il-button-icon content=${this.content}></il-button-icon>
      ${this.tooltipText && (this.condition === undefined || this.condition)
        ? html`<il-tooltip>${this.tooltipText}</il-tooltip>`
        : html``}
    </div> `;
  }
}

customElements.define("il-button-icon-with-tooltip", ButtonIconWithTooltip);
