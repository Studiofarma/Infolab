import { LitElement, html, css } from "lit";

import "./icon";

export class ButtonIcon extends LitElement {
	static get properties() {
		return {
			content: "",
			styleProp: "",
		};
	}

	static styles = css`
		:host {
			display: flex;
			align-items: center;
		}

		.icon-button {
			height: 100%;
			width: 100%;
			display: flex;
			justify-content: center;
			align-items: center;
			font-size: 0px;
			-webkit-font-smoothing: antialiased;
			cursor: pointer;
			user-select: none;
			padding: 5px;
		}

		.icon-button:hover {
			color: white;
		}
	`;

	render() {
		return html`
			<div class="icon-button">
				<il-icon
					name="${this.content}"
					style="${this.styleProp ? this.styleProp : ""}"
				></il-icon>
			</div>
		`;
	}
}

customElements.define("il-button-icon", ButtonIcon);
