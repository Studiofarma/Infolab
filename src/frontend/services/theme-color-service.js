import { css } from "lit";

import { lightTheme } from "../enums/themes/lightTheme";
import { darkTheme } from "../enums/themes/darkTheme";

export class ThemeColorService {
  static getCurrentThemeName() {
    return sessionStorage.getItem("theme") ?? "light";
  }

  static setCurrentThemeName(value) {
    sessionStorage.setItem("theme", value);
  }

  static getCurrentTheme() {
    const currentTheme = this.getCurrentThemeName();

    switch (currentTheme) {
      case "light":
        return lightTheme;

      case "dark":
        return darkTheme;
    }
  }

  static getThemeVariables() {
    const themeVariables = this.getCurrentTheme();

    let text = "";

    for (let key in themeVariables) {
      text += `--${key}: ${themeVariables[key]}; \n`;
    }

    return css([text]);
  }
}
