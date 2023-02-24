import { LitElement, html, css } from "lit";
import * as mdi from "@mdi/js";
import "@jamescoyle/svg-icon";

export class ButtonIcon extends LitElement {
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
      height: 100%;
      width: 100%;
      justify-content: center;
      align-items: center;
      font-weight: normal;
      font-style: normal;
      font-family: "Material Icons";
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
      min-height: 35px;
      min-width: 35px;
    }

    #button:hover {
      background-color: rgba(152, 154, 157, 0.3);
      border-radius: 50%;
    }
  `;

  render() {
    console.log(this.content);
    return html`
      <div id="button">
        <svg-icon type="mdi" path="${mdi[this.content]}"></svg-icon>
      </div>
    `;
  }
}

customElements.define("il-button-icon", ButtonIcon);
