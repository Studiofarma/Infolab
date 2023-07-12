import { LitElement, css, html } from "lit";
import { ThemeColorService } from "../../../services/theme-color-service";

import { ThemeCSSVariables } from "../../../enums/theme-css-variables";

export class EmptyMessages extends LitElement {
  static styles = css`
    * {
      ${ThemeColorService.getThemeVariables()};
    }

    div {
      width: 100%;
      height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
    h1 {
      color: ${ThemeCSSVariables.textPrimary};
    }

    h2 {
      color: ${ThemeCSSVariables.textSecondary};
    }
  `;

  render() {
    return html`
      <div>
        <h1>Nuova conversazione selezionata</h1>
        <h2>Per iniziare invia un messaggio</h2>
      </div>
    `;
  }
}

customElements.define("il-empty-messages", EmptyMessages);
