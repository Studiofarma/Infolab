export class HtmlParserService {
  static parseFromString(htmlString) {
    const parser = new DOMParser();
    const html = parser.parseFromString(htmlString, "text/html");
    return html.body;
  }
}
