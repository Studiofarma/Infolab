const axios = require("axios").default;

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

export class getMessagesServices {
  static async executeMessagesCall() {
    return axios.get("http://localhost:3000/messages");
  }
}
