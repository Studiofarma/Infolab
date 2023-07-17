import { LitElement, html, css, adoptStyles } from "lit";

import { ThemeColorService } from "../services/theme-color-service";

import { ThemeCSSVariables } from "../enums/theme-css-variables";

export class ButtonText extends LitElement {
  static get properties() {
    return {
      text: { type: String },
      isActive: { type: Boolean },
      color: { type: String },
    };
  }

  static styles = css`
    * {
      ${ThemeColorService.getThemeVariables()};
    }

    button {
      padding: 0px 24px;
      font-family: inherit;
      border-radius: 10px;
      text-align: center;
      border: 1px solid ${ThemeCSSVariables.buttonBorder};
      color: ${ThemeCSSVariables.buttonText};
      height: 40px;
      cursor: pointer;
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

      // updating pseudo elements

      for (let i = 0; i < rules.length; i++) {
        if (rules[i].selectorText.includes("::")) {
          let selectorName = rules[i].selectorText;

          let properties = rules[i].cssText
            .slice(
              rules[i].cssText.indexOf("{") + 1,
              rules[i].cssText.indexOf("}")
            )
            .split(";")
            .map((prop) => prop.trim())
            .filter((prop) => !prop.startsWith("--"))
            .join(";\n");

          let newCSS = `
              ${selectorName} {
                ${properties}
                ${ThemeColorService.getThemeVariables()}
              }
            `;

          stylesheet.deleteRule(i);
          stylesheet.insertRule(newCSS, i);
        }
      }

      adoptStyles(this.shadowRoot, [stylesheet]);
    });
  }

  render() {
    return html`
      <button
        style=${this.color
          ? `background: ${this.color}`
          : `background: ${ThemeCSSVariables.buttonConfirmBg};`}
      >
        ${this.text}
      </button>
    `;
  }
}

customElements.define("il-button-text", ButtonText);
