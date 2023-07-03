import { LitElement, css, html } from "lit";

export class Tooltip extends LitElement {
  static properties = {
    text: { type: String },
  };

  constructor() {
    super();
  }

  static styles = css``;

  render() {
    return html``;
  }
}

customElements.define("il-tooltip", Tooltip);
