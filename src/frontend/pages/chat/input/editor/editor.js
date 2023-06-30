import { LitElement, html, css } from "lit";
import { ref, createRef } from "lit/directives/ref.js";
import "../../../../styles/quill-snow.css";
import Quill from "quill";

const editorDefaultHeight = 54;
const editorMaxHeight = 166;

const enterKey = "Enter";

class Editor extends LitElement {
  static styles = css`
    #editor-container {
      height: ${editorDefaultHeight}px;
      max-height: ${editorMaxHeight}px;
      font-size: 20px;
      padding: 0px;
      margin: 0;
      border-radius: 10px;
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
    this.quillEditorRef = createRef();
  }

  render() {
    return html`
      <link
        rel="stylesheet"
        href="http://cdn.quilljs.com/1.3.6/quill.snow.css"
      />
      <div
        id="editor-container"
        ${ref(this.quillEditorRef)}
        @keydown=${this.onKeyDown}
      ></div>
    `;
  }

  firstUpdated() {
    this.init();
  }

  clearMessage() {
    this.quill.deleteText(0, this.quill.getLength());
  }

  focusEditor() {
    this.quill.focus();
  }

  textEditorResize() {
    const editor = this.shadowRoot.querySelector(".ql-editor");

    editor.style.height = `${editorDefaultHeight}px`;
    editor.style.height = `${editor.scrollHeight}px`;

    this.shadowRoot.querySelector(
      "#editor-container"
    ).style.height = `${editor.scrollHeight}px`;

    this.dispatchEvent(
      new CustomEvent("text-editor-resized", {
        detail: { height: editor.clientHeight },
      })
    );
  }

  init() {
    this.quill = new Quill(this.quillEditorRef.value, {
      modules: {
        toolbar: "",
      },
      placeholder: "Scrivi un messaggio...",
      theme: "snow",
    });

    this.quill.on("text-change", () => {
      this.textChanged();
    });
    this.quill.on("editor-change", () => {
      this.textChanged;
    });

    this.shadowRoot.querySelector(".ql-editor").style.maxHeight =
      editorMaxHeight + "px";
  }

  getHtml() {
    return this.shadowRoot.querySelector(".ql-editor p").innerHTML;
  }

  onKeyDown(event) {
    if (event.key === enterKey && !event.shiftKey) {
      this.enterKeyPressed();
      event.preventDefault();
    }

    this.textEditorResize();
  }

  textChanged() {
    this.dispatchEvent(
      new CustomEvent("text-changed", {
        detail: {
          content: this.getHtml(),
        },
      })
    );

    this.textEditorResize();
  }

  enterKeyPressed() {
    this.dispatchEvent(new CustomEvent("enter-key-pressed"));
  }
}

window.customElements.define("il-editor", Editor);
