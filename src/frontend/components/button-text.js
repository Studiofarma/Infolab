import { LitElement, html, css } from "lit";

export class ButtonText extends LitElement {
 
	static get properties() {
    return {
			text: {type: String},
			isActive:  {type: Boolean}
    };
  }

	static styles = css`
		button {
			padding: 0px 24px;
			font-family: inherit;
			border-radius: 10px 10px 0 0;
			background: rgb(8, 60, 114);
			text-align: center;
			border: 1px solid #616870;
			border-bottom: 0;
			color: rgb(194, 192, 192);
			height: 40px;
			cursor: pointer;
		}

		button:hover {
			color: white;
		}

		.active {
			border: 1px solid transparent;
			background: none;
			transform: translateY(1px);
		}
	`;

	render() {
		return html` <button class="${this.isActive ? "active" : ""}">${this.text}</button> `;
	}
}

customElements.define("il-button-text", ButtonText);
