import { LitElement, html, css } from "lit";

import { InputField } from "./input-field";

export class password extends InputField {
  static get properties() {
    return {
      pswVisibility: false,
    };
  }

  static styles = css`
    * {
      width: 100%;
    }

    #input {
      font: inherit;
      border: none;
      grid-area: input;
    }

    il-button-icon {
      opacity: 0;
      grid-area: icon;
    }

    il-button-icon:hover {
      opacity: 1;
    }

    div {
      display: grid;
      grid-template-areas: "input  icon";
      grid-template-columns: 1fr 40px;
      position: relative;
      width: 100%;
      height: 40px;
      padding: 5px 10px;
      border: solid 2px #5a9bfb;
      outline: none;
      font-size: 15pt;
      transition: 0.5s;
      border-radius: 10px;
      background-color: white;
    }
  `;

  render() {
    return html`
      ${this.title === "" ? html`` : html`<label>${this.title}</label>`}
      <div>
        <input
          placeholder="${this.placeholder}"
          id="input"
          @input=${this.setValue}
          @blur="${this.setBlur}"
          @focus="${this.setFocus}"
          type=${!this.pswVisibility ? "password" : "text"}
        />

        <il-button-icon
          @click=${this.setVisibility}
          content="${!this.pswVisibility ? "mdiEye" : "mdiEyeOff"}"
        ></il-button-icon>
      </div>
    `;
  }

  setFocus() {
    this.renderRoot.querySelector("div").style.border = "solid 2px #009C3E";
    this.renderRoot.querySelector("input").style.outline = "none";
  }

  setBlur() {
    this.renderRoot.querySelector("div").style.border = "solid 2px #5A9BFB";
  }

  setVisibility() {
    this.pswVisibility = !this.pswVisibility;
  }
}

customElements.define("il-input-password", password);
