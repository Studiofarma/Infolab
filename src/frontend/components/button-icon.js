import { LitElement, html, css } from "lit";

import "./icon";

export class ButtonIcon extends LitElement {
  static get properties() {
    return {
      content: "",
    };
  }

  static styles = css`
    :host {
      display: flex;
      align-items: center;
    }

    .icon-button {
      height: 100%;
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 0px;
      -webkit-font-smoothing: antialiased;
      cursor: pointer;
      user-select: none;
      min-height: 35px;
      min-width: 35px;
    }

    .icon-button:hover {
      background-color: rgba(152, 154, 157, 0.3);
      border-radius: 50%;
    }
  `;

  render() {
    return html`
      <div class="icon-button">
        <il-icon name="${this.content}"></il-icon>
      </div>
    `;
  }
}

customElements.define("il-button-icon", ButtonIcon);
