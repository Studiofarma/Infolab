import { LitElement, html, customElement, css } from "lit";
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

  getText() {
    return this.textareaRef.value?.value;
  }

  onInput(event) {
    if (this.isKeyDown) this.message = event.target.value;

    this.textChanged();
    this.textEditorResize();
    this.isKeyDown = false;
  }

  textChanged() {
    this.shadowRoot.querySelector("textarea").value = this.message;
    this.dispatchEvent(
      new CustomEvent("text-changed", {
        detail: { content: this.message },
      })
    );
  }

  textEditorResize() {
    const textarea = this.shadowRoot.querySelector("textarea");
    textarea.style.height = `${textareaDefaultHeight}px`;
    textarea.style.height = `${textarea.scrollHeight}px`;
    this.dispatchEvent(
      new CustomEvent("text-editor-resized", {
        detail: { height: textarea.clientHeight },
      })
    );
  }

  firstUpdated() {
    this.textEditorResize();
  }

  focusEditor() {
    this.textAreaRef.value.focus();
  }

  getSelection() {
    const textarea = this.shadowRoot.querySelector("textarea");
    return {
      start: textarea.selectionStart,
      end: textarea.selectionEnd,
      direction: textarea.selectionDirection,
    };
  }

  onKeyDown(event) {
    this.isKeyDown = true;

    if (event.key == keys.enter) {
      if (event.shiftKey) {
        // this.checkList(event);
      } else {
        this.dispatchEvent(new CustomEvent("enter-key-pressed"));
        event.preventDefault();
      }
    }

    // if (event.altKey) this.checkMarkdownKeys(event.key);
  }

  onKeyUp() {
    this.isKeyDown = false;
  }

  onBlur(e) {
    this.isKeyDown = false;
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
