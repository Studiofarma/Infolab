import { LitElement, html, css } from "lit";
import * as mdi from "@mdi/js";
import "@jamescoyle/svg-icon";

export class Icon extends LitElement {
	static get properties() {
		return {
			name: "",
		};
	}

	static styles = css`
		svg-icon {
			transform: translateY(-2px) !important;
		}
	`;

	render() {
		return html` <svg-icon type="mdi" path="${mdi[this.name]}"></svg-icon> `;
	}
}

customElements.define("il-icon", Icon);
