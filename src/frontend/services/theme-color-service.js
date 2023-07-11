import { css } from "lit";

import { ThemeColorsEnum } from "../enums/theme-colors";

export class ThemeColorService {
  static getCurrentTheme() {
    // TODO: implementare il controllo del tema attuale dell'utente nel session storage e ritornarlo
    return "light";
  }

  static getVariablesString(variables) {
    let text = "";

    for (let key in variables) {
      text += `--${key}: ${variables[key]}; \n`;
    }

    return text;
  }

  static applyStyle(layoutID) {
    const theme = this.getCurrentTheme();
    const variables = ThemeColorsEnum[theme][layoutID];
    const general = ThemeColorsEnum[theme]["general"];

    let cssString = this.getVariablesString(general);

    if (layoutID === "") return css([cssString]);

    cssString += this.getVariablesString(variables);

    return css([cssString]);
  }
}
