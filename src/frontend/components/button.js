import { LitElement, html, css } from "lit";

export class Button extends LitElement {
  constructor() {
    super();
  }

  static styles = css`
    #submit_btn {
      text-transform: uppercase;
      padding: 18px 23px;
      color: #e4e8ee;
      background: #00234f;
      border: none;
      outline: none;
      cursor: pointer;
      border-radius: 25px;
      width: 100%;
      margin-top: 25px;
    }

    input,
    button {
      font-family: inherit;
    }
  `;

  render() {
    return html`
      <div>
        <button id="submit_btn">Connetti</button>
      </div>
    `;
  }
}

customElements.define("il-button", Button);
