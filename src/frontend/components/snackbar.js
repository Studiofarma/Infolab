import { html, css } from "lit";
import { createRef, ref } from "lit/directives/ref.js";

import { ThemeColorService } from "../services/theme-color-service";

import "./button-icon";
import { IconNames } from "../enums/icon-names";
import { ThemeCSSVariables } from "../enums/theme-css-variables";

import { BaseComponent } from "./base-component";

export class Snackbar extends BaseComponent {
  constructor() {
    super();

    // Refs
    this.snackbarRef = createRef();
    this.textRef = createRef();
  }

  static styles = css`
    * {
      box-sizing: border-box;
      padding: 0px;
      margin: 0px;
      ${ThemeColorService.getThemeVariables()};
    }

    #snackbar {
      position: fixed;
      transform: translate(-50%, -50%);
      left: 50%;
      bottom: -80px;
      min-width: 500px;
      min-height: 40px;
      color: ${ThemeCSSVariables.snackbarText};
      border-radius: 10px;
      background: ${ThemeCSSVariables.snackbarBg};
      box-shadow: 0 0 20px ${ThemeCSSVariables.boxShadowPrimary};
      display: flex;
      align-items: center;
      transition: all 0.5s;
      padding: 5px;
      opacity: 0;
      z-index: 10000;
    }

    .error {
      border-bottom: 5px solid ${ThemeCSSVariables.error};
    }

    .warning {
      border-bottom: 5px solid ${ThemeCSSVariables.warning};
    }

    .info {
      border-bottom: 5px solid ${ThemeCSSVariables.info};
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

  closeSnackbar() {
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
