import { LitElement, adoptStyles } from "lit";

import { ThemeColorService } from "../services/theme-color-service";

// this function returns as a string all the css which aren't variables

function getCSSProperties(cssRule) {
  let ruleText = cssRule.cssText;

  ruleText = ruleText.slice(ruleText.indexOf("{") + 1, ruleText.indexOf("}"));

  return ruleText
    .split(";")
    .map((prop) => prop.trim())
    .filter((prop) => !prop.startsWith("--"))
    .join(";\n");
}

export class BaseComponent extends LitElement {
  connectedCallback() {
    super.connectedCallback();

    document.addEventListener("change-theme", () => {
      // changing the adoptedStylesheet
      let stylesheet = this.shadowRoot.adoptedStyleSheets[0];
      let rules = stylesheet.cssRules;

      let index = Object.values(rules).findIndex(
        (rule) => rule.selectorText === "*"
      );

      let universalSelectorProperties = getCSSProperties(rules[index]);

      let newSelectorText = `
                * {
                  ${universalSelectorProperties}
                  ${ThemeColorService.getThemeVariables().toString()}
                }
                
                `;

      stylesheet.deleteRule(index);
      stylesheet.insertRule(newSelectorText, index);

      // updating pseudo elements

      for (let i = 0; i < rules.length; i++) {
        if (rules[i].selectorText?.includes("::")) {
          let selectorName = rules[i].selectorText;

          let properties = getCSSProperties(rules[i]);

          let newCSS = `
                          ${selectorName} {
                            ${properties}
                            ${ThemeColorService.getThemeVariables().toString()}
                          }
                        `;

          stylesheet.deleteRule(i);
          stylesheet.insertRule(newCSS, i);
        }
      }

      adoptStyles(this.shadowRoot, [stylesheet]);
    });
  }
}
