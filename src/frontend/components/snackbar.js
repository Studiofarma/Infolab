import { LitElement, html, css } from "lit";
import { createRef, ref } from "lit/directives/ref.js";

import "./button-icon";
import { IconNames } from "../enums/icon-names";

export class Snackbar extends LitElement {
  constructor() {
    super();
    this.snackbarRef = createRef();
    this.textRef = createRef();
  }

  static styles = css`
    * {
      box-sizing: border-box;
      padding: 0px;
      margin: 0px;
    }

    #snackbar {
      position: fixed;
      transform: translate(-50%, -50%);
      left: 50%;
      bottom: -80px;
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
      <div id="snackbar" ${ref(this.snackbarRef)}>
        <p ${ref(this.textRef)}></p>
        <il-button-icon
          content=${IconNames.close}
          @click=${this.closeSnackbar}
        ></il-button-icon>
      </div>
    `;
  }

  closeSnackbar(type) {
    this.snackbarRef.value.style.opacity = 0.0;
    this.snackbarRef.value.style.bottom = `-${
      this.snackbarRef.value.clientHeight * 2
    }px`;
  }

  openSnackbar(content, type, time) {
    this.snackbarRef.value.style.display = "flex";

    this.snackbarRef.value.className = type;
    this.textRef.value.innerText = content;

    this.snackbarRef.value.style.opacity = 1.0;
    this.snackbarRef.value.style.bottom = "20px";

    setTimeout(() => this.closeSnackbar(type), time);
  }
}
customElements.define("il-snackbar", Snackbar);
