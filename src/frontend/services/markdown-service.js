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

  static insertBold(text) {
    let output;
    let regEx = /[*]{2}/g;
    if (text.startsWith("**") && text.endsWith("**"))
      output = text.replace(regEx, "");
    else output = "**" + text + "**";
    return output;
  }

  static insertItalic(text) {
    let output;
    let regEx = /[*]{1}/g;
    if (text.startsWith("*") && text.endsWith("*"))
      output = text.replace(regEx, "");
    else output = "*" + text + "*";
    return output;
  }

  static insertStrike(text) {
    let output;
    let regEx = /[~]{2}/g;
    if (text.startsWith("~~") && text.endsWith("~~"))
      output = text.replace(regEx, "");
    else output = "~~" + text + "~~";
    return output;
  }

  static insertLink(text) {
    let output;
    let regEx = /[\[\]]+|(\(.*\))/g;
    if (text.startsWith("[") && text.includes("](") && text.endsWith(")"))
      output = text.replace(regEx, "");
    else output = "[" + text + "](insert link)";
    return output;
  }

  static insertLine() {
    return "\n - - - \n";
  }

  static insertListBulleted(text) {
    return "* " + text;
  }

  static insertListNumbered(text) {
    return "1. " + text;
  }

  static insertHeading(text) {
    return "### " + text;
  }

  static checkTitle(text) {
    return text.startsWith("#");
  }

  static checkUnorderedList(text) {
    return text.startsWith("* ");
  }

  static checkOrderedList(text) {
    let indexOfDot = text.indexOf(".");
    if (indexOfDot !== -1) {
      let isList = true;

      for (let i = 0; i < indexOfDot; i++) {
        if (isNaN(Number(text[i]))) {
          isList = false;
          break;
        }
      }

      if (isList) return indexOfDot;
    }
    return -1;
  }

  static checkList(text) {
    return (
      MarkdownService.checkUnorderedList(text) ||
      MarkdownService.checkOrderedList(text) !== -1
    );
  }
}
