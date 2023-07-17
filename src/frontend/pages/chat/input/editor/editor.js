import { LitElement, html, css, adoptStyles } from "lit";
import { createRef, ref } from "lit/directives/ref.js";

import { ThemeColorService } from "../../../../services/theme-color-service";

import { ThemeCSSVariables } from "../../../../enums/theme-css-variables";

const enterKey = "Enter";

export class Editor extends LitElement {
  static properties = {
    isEditMode: false,
  };

  constructor() {
    super();
    this.isKeyDown = false;
    this.message = "";

    // Refs
    this.editorRef = createRef();
  }

  static styles = css`
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      ${ThemeColorService.getThemeVariables()};
    }

    #editor {
      color: ${ThemeCSSVariables.text};
      background-color: ${ThemeCSSVariables.editorInputBg};
      flex: 1;
      padding: 20px;
      outline: 0px solid transparent;
      padding: 5px;
      line-height: 20px;
      font-size: 20px;
      max-height: 100px;
      border-radius: 5px;
      overflow-y: auto;
    }

    #editor[placeholder]:empty:before {
      content: attr(placeholder);
    }

    ::-webkit-scrollbar {
      width: 4px;
    }

    ::-webkit-scrollbar-track {
      background-color: none;
    }

    ::-webkit-scrollbar-thumb {
      border-radius: 10px;
      background-color: ${ThemeCSSVariables.scrollbar};
    }

    ::-webkit-scrollbar:vertical {
      margin-right: 10px;
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
      <div
        ${ref(this.editorRef)}
        id="editor"
        contenteditable="true"
        @keydown=${this.onKeyDown}
        @keyup=${this.onKeyUp}
        @input=${this.onInput}
        @blur=${this.onBlur}
        placeholder="Inserisci un messaggio..."
      ></div>
    `;
  }

  clearMessage() {
    this.editorRef.value.innerHTML = "";
    this.resizeTextEditor();
  }

  insertInEditor(text) {
    this.focusEditor();
    this.isKeyDown = true;
    document.execCommand("insertText", false, text);
    this.isKeyDown = false;
  }

  onKeyDown(event) {
    this.isKeyDown = true;

    if (!this.isEditMode && event.key === enterKey) {
      event.preventDefault();
      if (event.shiftKey) document.execCommand("insertLineBreak");
      else this.sendMessage();
    }
  }

  onKeyUp() {
    this.isKeyDown = false;
  }

  onBlur() {
    this.isKeyDown = false;
  }

  focusEditor() {
    this.editorRef.value?.focus();
  }

  onInput(event) {
    if (!this.isKeyDown && event.inputType == "insertText") {
      this.editorRef.value.innerHTML = this.message;
      return;
    }

    this.resizeTextEditor();
    this.textChanged();
    this.message = this.getText();
  }

  textChanged() {
    const text = this.getText();

    this.dispatchEvent(
      new CustomEvent("il:text-changed", {
        detail: { content: text },
      })
    );
  }

  resizeTextEditor() {
    const height = this.editorRef.value.clientHeight;

    this.dispatchEvent(
      new CustomEvent("il:text-editor-resized", {
        detail: { height: height },
      })
    );
  }

  sendMessage() {
    this.dispatchEvent(new CustomEvent("il:enter-key-pressed"));
  }

  getText() {
    return this.editorRef.value.innerHTML;
  }

  setEditorText(text) {
    this.editorRef.value.innerHTML = text;
  }
}

customElements.define("il-editor", Editor);
