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

  static getText(text) {
    const editor = MarkdownService.getEditor();
    const textarea = editor.shadowRoot.querySelector("textarea");
    const selection = editor.getSelection();

    return textarea.value.slice(selection.start, selection.end);
  }

  static insertBold() {
    const text = MarkdownService.getText("grassetto");
    let regEx = /[*]{2}/g;
    if (text.startsWith("**") && text.endsWith("**"))
      MarkdownService.insertInTextArea(text.replace(regEx, ""));
    else MarkdownService.insertInTextArea("**" + text + "**");
  }

  static insertItalic() {
    const text = MarkdownService.getText("italic");
    let regEx = /[*]{1}/g;
    if (text.startsWith("*") && text.endsWith("*"))
      MarkdownService.insertInTextArea(text.replace(regEx, ""));
    else MarkdownService.insertInTextArea("*" + text + "*");
  }

  static insertStrike() {
    const text = MarkdownService.getText("barrato");
    let regEx = /[~]{2}/g;
    if (text.startsWith("~~") && text.endsWith("~~"))
      MarkdownService.insertInTextArea(text.replace(regEx, ""));
    else MarkdownService.insertInTextArea("~~" + text + "~~");
  }

  static insertLink() {
    const text = MarkdownService.getText("testo");
    let regEx = /[\[\]]+|(\(.*\))/g;
    if (text.startsWith("[") && text.includes("](") && text.endsWith(")"))
      MarkdownService.insertInTextArea(text.replace(regEx, ""));
    else MarkdownService.insertInTextArea("[" + text + "](insert link)");
  }

  static insertLine() {
    MarkdownService.insertInTextArea("\n - - - \n");
  }

  static insertListBulleted() {
    const text = MarkdownService.getText("punto");
    MarkdownService.insertInTextArea("* " + text);
  }

  static insertListNumbered() {
    const text = MarkdownService.getText("punto");
    MarkdownService.insertInTextArea("1. " + text);
  }

  static insertHeading() {
    const text = MarkdownService.getText("Titolo");
    MarkdownService.insertInTextArea("### " + text);
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
}
