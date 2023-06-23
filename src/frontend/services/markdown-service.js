export class MarkdownService {
  static parseMarkdown(text) {
    const md = require("markdown-it")({
      html: false,
      linkify: true,
    });

    const output =
      text === "" ? "Niente da visualizzare" : md.render(text.trim());
    return output;
  }

  static insertInTextArea(text) {
    const editor = MarkdownService.getEditor();
    const textarea = editor.shadowRoot.querySelector("textarea");
    const selection = editor.getSelection();

    editor.message =
      textarea.value.slice(0, selection.start) +
      text +
      textarea.value.slice(selection.end);
    editor.textChanged();
  }

  static getText() {
    const editor = MarkdownService.getEditor();
    const textarea = editor.shadowRoot.querySelector("textarea");
    const selection = editor.getSelection();

    return textarea.value.slice(selection.start, selection.end);
  }

  static insertBold() {
    const text = MarkdownService.getText();
    let regEx = /[*]{2}/g;
    if (text.startsWith("**") && text.endsWith("**"))
      MarkdownService.insertInTextArea(text.replace(regEx, ""));
    else MarkdownService.insertInTextArea("**" + text + "**");
    MarkdownService.focusTextarea();
  }

  static insertItalic() {
    const text = MarkdownService.getText();
    let regEx = /[*]{1}/g;
    if (text.startsWith("*") && text.endsWith("*"))
      MarkdownService.insertInTextArea(text.replace(regEx, ""));
    else MarkdownService.insertInTextArea("*" + text + "*");
    MarkdownService.focusTextarea();
  }

  static insertStrike() {
    const text = MarkdownService.getText();
    let regEx = /[~]{2}/g;
    if (text.startsWith("~~") && text.endsWith("~~"))
      MarkdownService.insertInTextArea(text.replace(regEx, ""));
    else MarkdownService.insertInTextArea("~~" + text + "~~");
    MarkdownService.focusTextarea();
  }

  static insertLink() {
    const text = MarkdownService.getText();
    let regEx = /[\[\]]+|(\(.*\))/g;
    if (text.startsWith("[") && text.includes("](") && text.endsWith(")"))
      MarkdownService.insertInTextArea(text.replace(regEx, ""));
    else MarkdownService.insertInTextArea("[" + text + "](insert link)");
    MarkdownService.focusTextarea();
  }

  static insertLine() {
    MarkdownService.insertInTextArea("\n - - - \n");
    MarkdownService.focusTextarea();
  }

  static insertListBulleted() {
    const text = MarkdownService.getText();
    MarkdownService.insertInTextArea("* " + text);
    MarkdownService.focusTextarea();
  }

  static insertListNumbered() {
    const text = MarkdownService.getText();
    MarkdownService.insertInTextArea("1. " + text);
    MarkdownService.focusTextarea();
  }

  static insertHeading() {
    const text = MarkdownService.getText();
    MarkdownService.insertInTextArea("### " + text);
    MarkdownService.focusTextarea();
  }

  static getEditor() {
    return (
      document
        .querySelector("il-app")
        .shadowRoot.querySelector("il-chat")
        .shadowRoot.querySelector("il-input-controls")
        .shadowRoot.querySelector("il-editor") ?? null
    );
  }

  static focusTextarea() {
    const textarea =
      MarkdownService.getEditor().shadowRoot.querySelector("textarea");
    textarea.focus();
  }
}
