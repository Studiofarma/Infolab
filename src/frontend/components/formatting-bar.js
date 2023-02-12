import { LitElement, html, css } from "lit";

export class FormattingBar extends LitElement {
  static styles = css`
    :host {
      padding: 5px 10px;
      display: flex;
      gap: 10px;
      background: rgb(90, 155, 251);
      margin-left: 15px;
    }

    label {
      padding: 5px;
      display: flex;
      justify-content: center;
      align-items: center;
      background: lightblue;
      font-weight: bold;
      cursor: pointer;
    }
  `;

  render() {
    return html`
      <label for="bold">
        bold
        <input type="checkbox" name="option" id="bold" />
      </label>
      <label for="underline">
        underline
        <input type="checkbox" name="option" id="underline" />
      </label>
      <label for="strike">
        strike
        <input type="checkbox" name="option" id="strike" />
      </label>
    `;
  }
}
customElements.define("il-formatting-bar", FormattingBar);
