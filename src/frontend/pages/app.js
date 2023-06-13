import { LitElement, html } from "lit";
import "./login/login.js";
import "./chat/chat.js";

export class App extends LitElement {
	static get properties() {
		return {
			login: {
				username: "",
				password: "",
				headerName: "",
				token: "",
			},
		};
	}

	constructor() {
		super();
		this.login = {
			username: "",
			password: "",
			headerName: "",
			token: "",
		};
	}

	render() {
		return html`
			${this.login.username === ""
				? html` <il-login @login-confirm="${this.loginConfirm}"></il-login> `
				: html` <il-chat .login=${this.login}></il-chat> `}
		`;
	}

	loginConfirm(e) {
		this.login = e.detail.login;
	}
}

customElements.define("il-app", App);
