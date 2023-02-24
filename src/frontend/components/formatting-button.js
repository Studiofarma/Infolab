import { LitElement, html, css } from "lit";

import { ButtonIcon } from "./button-icon";

export class FormattingButton extends ButtonIcon {
  static get properties() {
    return {
      content: "",
    };
  }

  static styles = css`
    :host {
      display: inline;
      align-items: center;
    }
    #button {
      font-family: "Material Icons";
      font-weight: normal;
      font-style: normal;
      font-size: 24px;
      line-height: 1;
      letter-spacing: normal;
      text-transform: none;
      display: flex;
      white-space: nowrap;
      word-wrap: normal;
      direction: ltr;
      -webkit-font-smoothing: antialiased;
      cursor: pointer;
      user-select: none;
      min-width: 25px;
      min-height: 25px;
      border-radius: 2px;
      padding: 5px;
      text-align: center;
      flex-direction: column;
    }

    #button:hover {
      background: #b7b9bd;
    }
  `;

  constructor() {
    super();
  }

  render() {
    return super.render();
  }
}
customElements.define("il-formatting-button", FormattingButton);
