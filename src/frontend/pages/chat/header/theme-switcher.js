import { html, css } from "lit";
import { ref, createRef } from "lit/directives/ref.js";

import { ThemeColorService } from "../../../services/theme-color-service";

import { IconNames } from "../../../enums/icon-names";
import { ThemeCSSVariables } from "../../../enums/theme-css-variables";

import "../../../components/button-icon";
import "../../../components/combo-box";

import { BaseComponent } from "../../../components/base-component";

export class ThemeSwitcher extends BaseComponent {
  static properties = {
    initialTheme: { type: String },
    theme: { type: String },
    themes: { type: Array },
  };

  constructor() {
    super();
    this.theme = ThemeColorService.getCurrentThemeName();
    this.themes = Object.keys(ThemeColorService.ThemesEnum);
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

    .theme-option {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .theme-option[hidden] {
      display: none;
    }

    div[slot="selection-list"] .theme-option {
      padding: 10px 15px;
      cursor: pointer;
      background: ${ThemeCSSVariables.buttonBg};
    }
  `;

  render() {
    return html`
      <il-combo-box
        placeholder="Tema"
        ${ref(this.accordionCheckBoxRef)}
        @selected-item=${this.selectThemeHandler}
      >
        <div slot="current">
          <div class="theme-option">
            <il-button-icon
              content=${this.getThemeIcon(this.theme) ?? ""}
            ></il-button-icon>
            <p>${this.theme}</p>
          </div>
        </div>

        <div slot="selection-list">
          ${this.themes.map(
            (themeName) => html`
              <div
                class="theme-option"
                data-key=${themeName}
                ?hidden=${this.theme === themeName}
              >
                <il-button-icon
                  content=${this.getThemeIcon(themeName) ?? ""}
                ></il-button-icon>
                <p>${themeName}</p>
              </div>
            `
          )}
        </div>
      </il-combo-box>
    `;
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

  selectThemeHandler(event) {
    // Getting the option selected

    const target = event.detail.target;
    const themeName = target.closest(".theme-option").dataset.key;

    // Setting the choosen theme

    this.theme = themeName;
    ThemeColorService.setCurrentThemeName(themeName);

    document.dispatchEvent(ThemeColorService.changeThemeEvent);
  }
}
customElements.define("il-theme-switcher", ThemeSwitcher);
