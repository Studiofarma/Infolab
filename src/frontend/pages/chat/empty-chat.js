import { LitElement, html, css } from "lit";

class EmptyChat extends LitElement {
	static styles = css`
		div {
			width: 100%;
			height: 100vh;
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
		}
		h1 {
			color: darkgray;
		}
		h2 {
			color: lightgray;
		}
	`;

	render() {
		return html`
			<div>
				<h1>Benvenuto</h1>
				<h2>Per iniziare seleziona una conversazione</h2>
			</div>
		`;
	}
}

customElements.define("il-empty-chat", EmptyChat);
