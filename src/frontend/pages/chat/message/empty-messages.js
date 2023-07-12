import { LitElement, css, html } from "lit";
import { ThemeColorService } from "../../../services/theme-color-service";

import { VariableNames } from "../../../enums/theme-colors";

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
      color: ${VariableNames.textPrimary};
    }

    h2 {
      color: ${VariableNames.textSecondary};
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
