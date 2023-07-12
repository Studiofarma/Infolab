import { css } from "lit";

import { lightTheme } from "../enums/themes/lightTheme"
import { darkTheme } from "../enums/themes/darkTheme"


export class ThemeColorService {
  static getCurrentTheme() {
    // TODO: implementare il controllo del tema attuale dell'utente nel session storage e ritornarlo
    const currentTheme = "light";

    switch(currentTheme) {

      case "light": return lightTheme;

      case "dark": return darkTheme;

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
