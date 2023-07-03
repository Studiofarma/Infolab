import { LitElement, html, css } from "lit";
import { ref, createRef } from "lit/directives/ref.js";
import "../../../../styles/quill-snow.css";
import "quill/dist/quill.core.css";
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
    this.quillToolbarRef = createRef();
  }

  render() {
    return html`
      <link
        rel="stylesheet"
        href="https://cdn.quilljs.com/1.3.6/quill.bubble.css"
      />

      <div id="editor-container" ${ref(this.quillEditorRef)}></div>
      <div id="toolbar" ${ref(this.quillToolbarRef)}>
        <button class="ql-bold">BOLD</button>
        <button class="ql-italic"></button>
        <button class="ql-strike"></button>
        <button class="ql-underline"></button>
        <button class="ql-link"></button>
      </div>
    `;
  }

  firstUpdated() {
    this.init();
  }

  // clearMessage() {
  //   this.quill.deleteText(0, this.quill.getLength());
  // }

  // focusEditor() {
  //   this.quill.focus();
  // }

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
        toolbar: [
          [{ header: [1, 2, false] }],
          ["bold", "italic", "underline"],
          ["image", "code-block"],
        ],
      },
      placeholder: "Compose an epic...",
      theme: "bubble",
    });

    // const normalizeNative = (nativeRange) => {
    //   // document.getSelection model has properties startContainer and endContainer
    //   // shadow.getSelection model has baseNode and focusNode
    //   // Unify formats to always look like document.getSelection

    //   if (nativeRange) {
    //     const range = nativeRange;

    //     if (range.baseNode) {
    //       range.startContainer = nativeRange.baseNode;
    //       range.endContainer = nativeRange.focusNode;
    //       range.startOffset = nativeRange.baseOffset;
    //       range.endOffset = nativeRange.focusOffset;

    //       if (range.endOffset < range.startOffset) {
    //         range.startContainer = nativeRange.focusNode;
    //         range.endContainer = nativeRange.baseNode;
    //         range.startOffset = nativeRange.focusOffset;
    //         range.endOffset = nativeRange.baseOffset;
    //       }
    //     }

    //     if (range.startContainer) {
    //       return {
    //         start: { node: range.startContainer, offset: range.startOffset },
    //         end: { node: range.endContainer, offset: range.endOffset },
    //         native: range,
    //       };
    //     }
    //   }

    //   return null;
    // };

    // // Hack Quill and replace document.getSelection with shadow.getSelection

    // this.quill.selection.getNativeRange = () => {
    //   const dom = this.quill.root.getRootNode();
    //   const selection = dom.getSelection();
    //   const range = normalizeNative(selection);

    //   return range;
    // };

    // // Subscribe to selection change separately,
    // // because emitter in Quill doesn't catch this event in Shadow DOM

    // document.addEventListener("selectionchange", (...args) => {
    //   // Update selection and some other properties

    //   this.quill.selection.update();
    // });

    this.quill.on("text-change", () => {
      this.textChanged();
    });
    this.quill.on("editor-change", () => {
      this.textChanged();
    });

    this.shadowRoot.querySelector(".ql-editor").style.maxHeight =
      editorMaxHeight + "px";
  }

  getHtml() {
    return this.shadowRoot.querySelector(".ql-editor p").innerHTML;
  }

  // onKeyDown(event) {
  //   if (event.key === enterKey && !event.shiftKey) {
  //     this.enterKeyPressed();
  //     event.preventDefault();
  //   }

  //   this.textEditorResize();
  // }

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

  // enterKeyPressed() {
  //   this.dispatchEvent(new CustomEvent("enter-key-pressed"));
  // }
}

window.customElements.define("il-editor", Editor);
