import { css } from "lit";

import { lightTheme } from "../enums/themes/lightTheme";
import { darkTheme } from "../enums/themes/darkTheme";
import { ThemeCSSVariables } from "../enums/theme-css-variables";

export class ThemeColorService {
  static changeThemeEvent = new CustomEvent("change-theme");

  static ThemesEnum = {
    light: lightTheme,
    dark: darkTheme,
  };

  static getCurrentThemeName() {
    return sessionStorage.getItem("theme") ?? "light";
  }

  static setCurrentThemeName(value) {
    sessionStorage.setItem("theme", value);
  }

  static getCurrentTheme() {
    const currentTheme = this.getCurrentThemeName();

    return this.ThemesEnum[currentTheme];
  }

  static getThemeVariables() {
    const themeVariables = this.getCurrentTheme();

    let text = "";

    for (let key in themeVariables) {
      text += `--${key}: ${themeVariables[key]}; \n`;
    }

    return css([text]);
  }

  static getColorForUser(userId, fallbackId) {
    switch ((userId ?? fallbackId) % 8) {
      case 0:
        return `${ThemeCSSVariables.avatarBg0}`;
      case 1:
        return `${ThemeCSSVariables.avatarBg1}`;
      case 2:
        return `${ThemeCSSVariables.avatarBg2}`;
      case 3:
        return `${ThemeCSSVariables.avatarBg3}`;
      case 4:
        return `${ThemeCSSVariables.avatarBg4}`;
      case 5:
        return `${ThemeCSSVariables.avatarBg5}`;
      case 6:
        return `${ThemeCSSVariables.avatarBg6}`;
      case 7:
        return `${ThemeCSSVariables.avatarBg7}`;
    }
  }
}
