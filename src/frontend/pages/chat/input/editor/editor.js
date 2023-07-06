import { LitElement, html, css } from "lit";
import { createRef, ref } from "lit/directives/ref.js";

const enterKey = "Enter";

export class Editor extends LitElement {
  static properties = {
    isEditMode: false,
  };

  static styles = css`
    #editor {
      background-color: white;
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
      background-color: #206cf7;
    }

    ::-webkit-scrollbar:vertical {
      margin-right: 10px;
    }
  `;

  constructor() {
    super();
    this.editorRef = createRef();
  }

  render() {
    return html`
      <div
        id="editor"
        contenteditable="true"
        ${ref(this.editorRef)}
        @keydown=${this.onKeyDown}
        @input=${this.onInput}
        placeholder="Inserisci un messaggio..."
      ></div>
    `;
  }

  clearMessage() {
    this.editorRef.value.innerHTML = "";
    this.textEditorResized();
  }

  insertInEditor(text) {
    this.focusEditor();
    document.execCommand("insertText", false, text);
  }

  onKeyDown(event) {
    if (!this.isEditMode && event.key === enterKey) {
      event.preventDefault();
      if (event.shiftKey) document.execCommand("insertLineBreak");
      else this.sendMessage();
    }
  }

  focusEditor() {
    this.editorRef.value.focus();
  }

  onInput() {
    this.textEditorResized();
    this.textChanged();
  }

  textChanged() {
    const text = this.getText();

    this.dispatchEvent(
      new CustomEvent("text-changed", {
        detail: { content: text },
      })
    );
  }

  textEditorResized() {
    const height = this.editorRef.value.clientHeight;

    this.dispatchEvent(
      new CustomEvent("text-editor-resized", {
        detail: { height: height },
      })
    );
  }

  sendMessage() {
    this.dispatchEvent(new CustomEvent("enter-key-pressed"));
  }

  getText() {
    return this.editorRef.value.innerHTML;
  }

  setEditorText(text) {
    this.editorRef.value.innerHTML = text;
  }
}

customElements.define("il-editor", Editor);
