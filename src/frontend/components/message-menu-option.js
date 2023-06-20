import { LitElement, html, css } from "lit";


import "./icon.js";

export class MessageMenuOption extends LitElement {
	static properties = {
		iconName: { type: String },
		text: { type: String },
		callback: { type: Function }, //sarà la funzione da richiamre
	};

	static styles = css`
		div {
			padding: 2px 0px;
			cursor: pointer;
		}
	`;

	render() {
		return html`
			<div @click=${this.handler}>
				<il-icon name=${this.iconName}></il-icon>
				${this.text}
			</div>
		`;
	}

  handler() {
    // richiama la funzione passatta attraverso il campo callback
    // da implementare
  }

}

customElements.define("message-menu-option", MessageMenuOption);
