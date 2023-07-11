import { LitElement, html, css } from "lit";
import { ThemeColorService } from "../../services/theme-color-service";

class EmptyChat extends LitElement {
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
        <h1>Benvenuto</h1>
        <h2>Per iniziare seleziona una conversazione</h2>
      </div>
    `;
  }
}

customElements.define("il-empty-chat", EmptyChat);
