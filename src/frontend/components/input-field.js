import { LitElement, html, css } from "lit";

import "./button-icon";

export class InputField extends LitElement {
	static get properties() {
		return {
			placeholder: "",
			value: "",
			title: "",
			selectionStart: "",
			selectionEnd: "",
		};
	}

	constructor() {
		super();
		this.value = "";
	}

	static styles = css`
		* {
			width: 100%;
		}

		#container {
			width: 100%;
		}

		input {
			font: inherit;
			position: relative;
			width: 100%;
			height: 40px;
			padding: 5px 10px;
			background-color: rgb(8, 60, 114);
			color: white;
			border: none;
			outline: none;
			font-size: 15pt;
			transition: 0.5s;
			border-radius: 10px;
		}

		input::placeholder {
			color: rgb(214, 214, 214);
		}
	`;

	render() {
		return html`
			${this.title === "" ? html`` : html`<label>${this.title}</label>`}
			<input
				id="message-input"
				placeholder="${this.placeholder}"
				@input=${this.setValue}
				.value=${this.value}
			/>
		`;
	}

	firstUpdated() {
		this.renderRoot.querySelector("input").focus();
	}

	setValue(e) {
		this.value = e.target.value;
		this.selectionStart = e.target.selectionStart;
		this.selectionEnd = e.target.selectionEnd;
	}

	clear() {
		this.renderRoot.querySelector("input").value = "";
	}
}

customElements.define("il-input-field", InputField);
