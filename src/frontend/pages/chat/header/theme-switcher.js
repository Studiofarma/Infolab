import { LitElement, html, css } from "lit";
import { ref, createRef } from "lit/directives/ref.js";

import { ThemeColorService } from "../../../services/theme-color-service";

import { IconNames } from "../../../enums/icon-names";
import { ThemeCSSVariables } from "../../../enums/theme-css-variables";

import "../../../components/button-icon";
import "../../../components/accordion-checkbox";

import { ElementMixin } from "../../../models/element-mixin";

export class ThemeSwitcher extends ElementMixin(LitElement) {
  static properties = {
    initialTheme: { type: String },
    theme: { type: String },
    themes: { type: Array },
  };

  constructor() {
    super();
    this.theme = ThemeColorService.getCurrentThemeName();
    this.themes = ["light", "dark"];
    this.initialTheme = "";

    // Refs
    this.accordionCheckBoxRef = createRef();
  }

  static styles = css`
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      ${ThemeColorService.getThemeVariables()};
    }

    p {
      color: ${ThemeCSSVariables.text};
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

    .theme-option[hidden] {
      display: none;
    }

    .theme-option:hover {
      background: ${ThemeCSSVariables.messageMenuBgHover};
    }

    .current span {
      display: block;
      margin-left: auto;
      font-size: 20px;
      font-weight: 900;
      color: ${ThemeCSSVariables.actionText};
    }

    .themes-selection {
      max-height: 0px;
      overflow-y: hidden;
      transition: max-height 0.5s;
    }

    .themes-selection.open {
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
      <il-accordion-checkbox
        ${ref(this.accordionCheckBoxRef)}
        @selected-item=${this.foo}
      >
        <p slot="current">lorem 1</p>

        <div slot="selection-list">
          <p>lorem 2</p>
          <p>lorem 3</p>
          <p>lorem 4</p>
          <p>lorem 5</p>
        </div>
      </il-accordion-checkbox>

      <!-- <div class="container">
        <div class="theme-option current" @click=${this.toggleThemesSelection}>
          <il-button-icon
            content=${this.getThemeIcon(this.theme) ?? ""}
          ></il-button-icon>
          <p>${this.theme}</p>
          <span>${this.isThemesSelectionOpened ? "-" : "+"}</span>
        </div>

        <div
          class=${"themes-selection " +
      (this.isThemesSelectionOpened ? "open" : "")}
        >
          ${this.themes.map(
        (themeName) => html`
          <div
            class="theme-option"
            ?hidden=${this.theme === themeName}
            @click=${() => this.setTheme(themeName)}
          >
            <il-button-icon
              content=${this.getThemeIcon(themeName) ?? ""}
            ></il-button-icon>
            <p>${themeName}</p>
          </div>
        `
      )}
        </div>
      </div> -->
    `;
  }

  foo(event) {
    console.log(event.detail.target);
  }

  firstUpdated() {
    this.initialTheme = ThemeColorService.getCurrentThemeName();
  }

  // Getters & Setters

  setIsThemesSelectionOpened(value) {
    this.accordionCheckBoxRef.value?.setIsSelectionListOpened(value);
  }

  setTheme(value) {
    this.theme = value;
  }

  getInitialTheme() {
    return this.initialTheme;
  }

  setInitialTheme(value) {
    this.initialTheme = value;
  }

  // ----------------------------

  getThemeIcon(themeName) {
    let icon;
    switch (themeName) {
      case "light":
        icon = IconNames.sun;
        break;

      case "dark":
        icon = IconNames.moon;
        break;
    }

    return icon;
  }

  setTheme(themeName) {
    this.theme = themeName;
    ThemeColorService.setCurrentThemeName(themeName);

    document.dispatchEvent(ThemeColorService.changeThemeEvent);
  }
}
customElements.define("il-theme-switcher", ThemeSwitcher);
