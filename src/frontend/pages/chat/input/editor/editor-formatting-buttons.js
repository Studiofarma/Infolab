import { LitElement, html, css } from "lit";

import "../../../../components/formatting-button";

import { MarkdownService } from "../../../../services/markdown-services";
import { IconNames } from "../../../../enums/icon-names";

export class EditorFormattingButtons extends LitElement {
	static styles = css`
		il-formatting-button {
			color: #c2c0c0;
		}
	`;

	constructor() {
		super();
	}

	render() {
		return html`
			<il-formatting-button
				content=${IconNames.bold}
				@click=${MarkdownService.insertBold}
			></il-formatting-button>

			<il-formatting-button
				content=${IconNames.italic}
				@click=${MarkdownService.insertItalic}
			></il-formatting-button>

			<il-formatting-button
				content=${IconNames.strikethrough}
				@click=${MarkdownService.insertStrike}
			></il-formatting-button>

			<il-formatting-button
				content=${IconNames.link}
				@click=${MarkdownService.insertLink}
			></il-formatting-button>

			<il-formatting-button
				content=${IconNames.minus}
				@click=${MarkdownService.insertLine}
			></il-formatting-button>

			<il-formatting-button
				content=${IconNames.listBulleted}
				@click=${MarkdownService.insertListBulleted}
			></il-formatting-button>

			<il-formatting-button
				content=${IconNames.listNumbered}
				@click=${MarkdownService.insertListNumbered}
			></il-formatting-button>

			<il-formatting-button
				content=${IconNames.title}
				@click=${MarkdownService.insertHeading}
			></il-formatting-button>
		`;
	}
}
customElements.define("il-editor-formatting-buttons", EditorFormattingButtons);
