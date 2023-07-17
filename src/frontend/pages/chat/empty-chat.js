import { LitElement, html, css, adoptStyles } from "lit";
import { ThemeColorService } from "../../services/theme-color-service";

import { ThemeCSSVariables } from "../../enums/theme-css-variables";

class EmptyChat extends LitElement {
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

  connectedCallback() {
    super.connectedCallback();

    document.addEventListener("change-theme", () => {
      // changing the adoptedStylesheet
      let stylesheet = this.shadowRoot.adoptedStyleSheets[0];
      let rules = stylesheet.cssRules;

      let index = Object.values(rules).findIndex(
        (rule) => rule.selectorText === "*"
      );

      let newSelectorText = `
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    ${ThemeColorService.getThemeVariables().toString()};
  }`;

      stylesheet.deleteRule(index);
      stylesheet.insertRule(newSelectorText, index);

      adoptStyles(this.shadowRoot, [stylesheet]);
    });
  }

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
