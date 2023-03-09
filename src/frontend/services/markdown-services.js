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
}
