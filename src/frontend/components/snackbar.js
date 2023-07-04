import { LitElement, html, css } from "lit";
import { createRef, ref } from "lit/directives/ref.js";

import "./button-icon";
import { IconNames } from "../enums/icon-names";

export class Snackbar extends LitElement {
  static properties = {
    content: "",
    type: "",
  };

  constructor() {
    super();
    this.content = "";
    this.type = "";
    this.snackbarRef = createRef();
  }

  static styles = css`
    * {
      box-sizing: border-box;
      padding: 0px;
      margin: 0px;
    }

    #snackbar {
      display: block;
      position: fixed;
      transform: translate(-50%, -50%);
      left: 50%;
      bottom: 10px;
      min-width: 500px;
      min-height: 40px;
      color: black;
      border-radius: 10px;
      background: white;
      box-shadow: 0 0 20px black;
      display: flex;
      align-items: center;
      transition: all 0.5s;
      padding: 5px;
      opacity: 0;
      z-index: 1000;
    }

    .error {
      border-bottom: 5px solid #fe354b;
    }

    .warning {
      border-bottom: 5px solid #f7a635;
    }

    .info {
      border-bottom: 5px solid #206cf7;
    }

    p {
      flex-grow: 1;
      text-align: center;
    }

    il-button-icon {
      opacity: 0;
      transition: 0.5s;
    }

    #snackbar:hover il-button-icon {
      opacity: 1;
    }
  `;

  render() {
    return html`
      <div id="snackbar" class=${this.type} ${ref(this.snackbarRef)}>
        <p>${this.content}</p>
        <il-button-icon
          content=${IconNames.close}
          @click=${this.closeSnackbar}
        ></il-button-icon>
      </div>
    `;
  }

  closeSnackbar() {
    this.snackbarRef.value.style.opacity = 0.0;
    this.snackbarRef.value.style.bottom = "10px";
  }

  openSnackbar(time) {
    this.snackbarRef.value.style.opacity = 1.0;
    this.snackbarRef.value.style.bottom = "20px";
    setTimeout(() => this.closeSnackbar(), time);
  }
}
customElements.define("il-snackbar", Snackbar);
