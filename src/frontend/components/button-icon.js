import { LitElement, html, css, unsafeCSS, adoptStyles } from "lit";
import { when } from "lit/directives/when.js";

import { ThemeColorService } from "../services/theme-color-service";

import { ThemeCSSVariables } from "../enums/theme-css-variables";

import "./icon";
import "./tooltip";

export class ButtonIcon extends LitElement {
  static properties = {
    content: { type: String },
    color: { type: String },
    tooltipText: { type: String },
    condition: { type: Boolean },
  };

  static styles = css`
    * {
      ${ThemeColorService.getThemeVariables()};
    }

    :host {
      display: flex;
      align-items: center;
    }

    .icon-button {
      height: 100%;
      width: 100%;
      font-size: 0px;
      -webkit-font-smoothing: antialiased;
      cursor: pointer;
      user-select: none;
      padding: 5px;
      color: ${ThemeCSSVariables.iconColor};
    }

    .contanier {
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: inherit;
      border-radius: inherit;
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
      <div class="container">
        <div class="icon-button" .style="color: ${unsafeCSS(this.color)}">
          <il-icon name="${this.content}"></il-icon>
        </div>
        ${when(
          this.tooltipText && (this.condition === undefined || this.condition),
          () => html`<il-tooltip>${this.tooltipText}</il-tooltip>`,
          () => html``
        )}
      </div>
    `;
  }
}

customElements.define("il-button-icon", ButtonIcon);
