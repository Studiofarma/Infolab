import { LitElement, css, html } from "lit";
import { ThemeColorService } from "../../../services/theme-color-service";

export class EmptyMessages extends LitElement {
  static styles = css`

  * {
    ${ThemeColorService.applyStyle()};
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
      color: var(--textPrimary);
    }

    h2 {
      color: var(--textSecondary);
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
