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
      <il-accordion-checkbox
        placeholder="Tema"
        ${ref(this.accordionCheckBoxRef)}
        @selected-item=${this.foo}
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
              <div class="theme-option" ?hidden=${this.theme === themeName}>
                <il-button-icon
                  content=${this.getThemeIcon(themeName) ?? ""}
                ></il-button-icon>
                <p>${themeName}</p>
              </div>
            `
          )}
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
