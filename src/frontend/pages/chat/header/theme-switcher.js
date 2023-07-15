import { LitElement, html, css } from "lit";
import { ref, createRef } from "lit/directives/ref.js";

import { ThemeColorService } from "../../../services/theme-color-service";

import { IconNames } from "../../../enums/icon-names";
import { ThemeCSSVariables } from "../../../enums/theme-css-variables";

import "../../../components/button-icon";

export class ThemeSwitcher extends LitElement {
  static properties = {
    isThemesSelectionOpened: { type: Boolean },
  };

  constructor() {
    super();
    this.isThemesSelectionOpened = false;
  }

  static styles = css`
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      ${ThemeColorService.getThemeVariables()};
    }

    .container {
      position: relative;
      display: flex;
      flex-direction: column;
      border: 2px solid ${ThemeCSSVariables.inputBorder};
      border-radius: 10px;
      overflow-x: hidden;
    }

    .theme-option {
      position: relative;
      width: 100%;
      height: 50px;
      padding: 0px 20px;
      display: flex;
      align-items: center;
      gap: 1em;
      background: ${ThemeCSSVariables.inputBackground};
      cursor: pointer;
      transition: 0.5s;
    }

    .theme-option:hover {
      background: ${ThemeCSSVariables.messageMenuBgHover};
    }

    .current span {
      display: block;
      margin-left: auto;
      font-size: 20px;
      font-weight: 900;
    }

    .themes-selection {
      max-height: 0px;
      overflow-y: hidden;
      transition: all 1s;
    }

    .open {
      max-height: 1000px;
      overflow-y: auto;
    }

    ::-webkit-scrollbar {
      width: 4px;
      margin-right: 10px;
    }

    ::-webkit-scrollbar-track {
      background-color: none;
    }

    ::-webkit-scrollbar-thumb {
      border-radius: 10px;
      background-color: ${ThemeCSSVariables.scrollbar};
    }
  `;

  render() {
    return html`
      <div class="container">
        <div class="theme-option current" @click=${this.toggleThemesSelection}>
          <il-button-icon content=${IconNames.dotsHorizontal}></il-button-icon>
          <p>Lorem1</p>
          <span>${this.isThemesSelectionOpened ? "-" : "+"}</span>
        </div>

        <div
          class=${"themes-selection " +
          (this.isThemesSelectionOpened ? "open" : "")}
        >
          <div class="theme-option ">
            <il-button-icon content=${IconNames.checkCircle}></il-button-icon>
            <p>Lorem2</p>
          </div>
          <div class="theme-option ">
            <il-button-icon content=${IconNames.checkCircle}></il-button-icon>
            <p>Lorem3</p>
          </div>
          <div class="theme-option ">
            <il-button-icon content=${IconNames.checkCircle}></il-button-icon>
            <p>Lorem4</p>
          </div>
          <div class="theme-option ">
            <il-button-icon content=${IconNames.checkCircle}></il-button-icon>
            <p>Lorem5</p>
          </div>
        </div>
      </div>
    `;
  }

  toggleThemesSelection() {
    this.isThemesSelectionOpened = !this.isThemesSelectionOpened;
    this.requestUpdate();
  }
}
customElements.define("il-theme-switcher", ThemeSwitcher);
