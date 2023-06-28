import { LitElement, html } from "lit";
import "./login/login.js";
import "./chat/chat.js";
import { ref, createRef } from 'lit/directives/ref.js';

export class App extends LitElement {
	static get properties() {
		return {
			login: {
				username: "",
				password: "",
				headerName: "",
				token: "",
			},
			chatRef: {type: Object}
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
		this.chatRef = createRef()
	}

	render() {
		return html`
			${this.login.username === ""
				? html` <il-login @login-confirm="${this.loginConfirm}"></il-login> `
				: html` <il-chat .login=${this.login  } ${ref(this.chatRef)} .chatRef=${this.chatRef}></il-chat> `}
		`; 
	}

	loginConfirm(e) {
		this.login = e.detail.login;
	}
}

customElements.define("il-app", App);
