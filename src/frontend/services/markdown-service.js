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

  static insertInTextArea(str) {
    let textarea = MarkdownService.getTextarea();
    let start = textarea.selectionStart;
    let finish = textarea.selectionEnd;

    let message = document
      .querySelector("il-app")
      .shadowRoot.querySelector("il-chat")
      .shadowRoot.querySelector("il-input-controls")
      .shadowRoot.querySelector("il-editor").message;
    message =
      textarea.value.slice(0, start) + str + textarea.value.slice(finish);
    document
      .querySelector("il-app")
      .shadowRoot.querySelector("il-chat")
      .shadowRoot.querySelector("il-input-controls")
      .shadowRoot.querySelector("il-editor").message = message;
  }

  static getText(text) {
    let sel = window.getSelection();
    let t = sel ? sel.toString() : "";
    if (t !== "") sel.deleteFromDocument();
    else t = text;
    return t;
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

  static getTextarea() {
    return (
      document
        .querySelector("il-app")
        .shadowRoot.querySelector("il-chat")
        .shadowRoot.querySelector("il-input-controls")
        .shadowRoot.querySelector("il-editor")
        .shadowRoot.querySelector("textarea") ?? null
    );
  }
}
