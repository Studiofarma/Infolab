import { LitElement, html, css } from "lit";

import { ButtonIcon } from "./button-icon";

export class FormattingButton extends ButtonIcon {
	static get properties() {
		return {
			content: "",
		};
	}

	constructor() {
		super();
	}

	render() {
		return super.render();
	}
}
customElements.define("il-formatting-button", FormattingButton);
