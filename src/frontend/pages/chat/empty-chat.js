import { LitElement, html, css, adoptStyles } from "lit";
import { ThemeColorService } from "../../services/theme-color-service";

import { ThemeCSSVariables } from "../../enums/theme-css-variables";

import { ElementMixin } from "../../models/element-mixin";

class EmptyChat extends ElementMixin(LitElement) {
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
        <h1>Benvenuto</h1>
        <h2>Per iniziare seleziona una conversazione</h2>
      </div>
    `;
  }
}

customElements.define("il-empty-chat", EmptyChat);
