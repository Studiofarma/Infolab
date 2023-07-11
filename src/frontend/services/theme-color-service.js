import { css } from "lit";

import { ThemeColorsEnum } from "../enums/theme-colors";

export class ThemeColorService {
  
  static getCurrentTheme() {
    // TODO: implementare il controllo del tema attuale dell'utente nel session storage e ritornarlo
    return "light";
  }

  static applyStyle() {
    const theme = this.getCurrentTheme();
    const variables = ThemeColorsEnum[theme];

    let text = "";

    for(let key in variables) {
      text += `--${key}: ${variables[key]}; \n`;      
    }

    return css([text]);

  }
}
