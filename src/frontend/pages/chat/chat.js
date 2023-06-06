import { LitElement, html, css } from "lit";
import { resolveMarkdown } from "lit-markdown";
import SockJS from "sockjs-client";
import Stomp from "stompjs";

import { MarkdownService } from "../../services/markdown-services";
import { MessagesService } from "../../services/messages-service";

import { IconNames } from "../../enums/icon-names";

import "../../components/button-icon";
import "./input/input-controls.js";
import "./sidebar/sidebar.js";
import "./header/chat-header.js";

export class Chat extends LitElement {
	static properties = {
		stompClient: {},
		messages: [],
		message: "",
		nMessages: 0,
	};

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
		this.messages = [];
		this.message = "";
		this.nMessages = 0;
		this.scrolledToBottom = false;
		window.addEventListener("resize", () => {
			this.scrollToBottom();
		});
	}

	connectedCallback() {
		super.connectedCallback();
		this.createSocket();
	}

	static styles = css`
		* {
			box-sizing: border-box;
			margin: 0;
			padding: 0;
		}

		main {
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			min-height: 100%;
			background: rgb(247, 247, 247);
		}

		input[type="text"] {
			border: none;
			outline: none;
		}

		section {
			display: grid;
			grid-template-columns: 350px auto;
			min-height: 100vh;
		}

		.chat {
			position: relative;
		}

		.chatHeader {
			position: fixed;
			top: 0px;
			left: 350px;
			background: #083c72;
			box-shadow: 0px 1px 5px black;
			width: calc(100% - 350px);
			min-height: 50px;
			padding: 15px 30px;
			display: flex;
			justify-content: space-between;
			align-items: center;
			color: white;
			z-index: 1000;
		}

		.chatHeader .settings {
			order: 2;
			display: flex;
		}

		.chatHeader .contact {
			order: 1;
			display: flex;
			gap: 1em;
		}

		il-input-controls {
			margin-top: auto;
		}

		.message-box {
			list-style-type: none;
			display: flex;
			flex-direction: column;
			gap: 30px;
			width: 100%;
			height: calc(100vh - 110px);
			overflow-y: auto;
			padding: 20px;
			padding-top: 100px;
		}

		.message-box::-webkit-scrollbar {
			width: 0px;
		}

		li {
			list-style-position: inside;
		}

		.message-box > li {
			position: relative;
			min-width: 300px;
			max-width: 500px;
			padding: 8px 8px 6px 10px;
			box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
			z-index: 3;
		}

		:not(.dropdown)::-webkit-scrollbar {
			background-color: #0074bc;
			border-radius: 10px;
			border: 5px solid #083c72;
		}

		:not(.dropdown)::-webkit-scrollbar-thumb {
			background-color: #0da2ff;
			border-radius: 10px;
			width: 5px;
			border: 3px solid #083c72;
		}

		input {
			font-family: inherit;
		}

		.sender {
			align-self: flex-end !important;
			border-radius: 10px 0 10px 10px;

			color: white;
			background-color: rgb(54, 123, 251);
		}
		.sender::after {
			content: "";
			position: absolute;
			top: 0px;
			right: -9px;
			border-top: 10px solid rgb(54, 123, 251);
			border-left: 0px solid transparent;
			border-right: 10px solid transparent;
			z-index: 3;
		}
		.sender::before {
			content: "";
			position: absolute;
			top: -1px;
			right: -13px;
			border-top: 11px solid rgb(209 209 209 / 34%);
			border-left: 0px solid transparent;
			border-right: 12px solid transparent;
			filter: blur(0.8px);
			z-index: 2;
		}

		.receiver {
			align-self: flex-start !important;
			border-radius: 0 10px 10px 10px;

			color: black;
			background-color: white;
		}
		.receiver::after {
			content: "";
			position: absolute;
			top: 0px;
			left: -9px;
			border-top: 10px solid white;
			border-left: 10px solid transparent;
			border-right: 0px solid transparent;
			z-index: 3;
		}
		.receiver::before {
			content: "";
			position: absolute;
			top: -1px;
			left: -13px;
			border-top: 11px solid rgb(209 209 209 / 34%);
			border-right: 0px solid transparent;
			border-left: 12px solid transparent;
			filter: blur(0.8px);
			z-index: 2;
		}
		.receiver-name {
			font-size: 13px;
			color: blue;
		}

		.message {
			overflow-wrap: break-word;
		}

		.sender .message-timestamp {
			text-align: end;

			font-size: 11px;
			color: #e9e9e9;
		}

		.receiver .message-timestamp {
			text-align: end;

			font-size: 11px;
			color: #8c8d8d;
		}

		.scroll-button {
			z-index: 9999;
			position: absolute;
			right: 20px;
			bottom: 130px;

			border-radius: 5px;
			padding: 2px;
			background-color: rgb(8, 60, 114);
			color: white;
			opacity: 0;
			transition: opacity 0.2s ease-in-out;
		}
	`;

	render() {
		return html`
			<main>
				<section>
					<il-sidebar></il-sidebar>
					<div class="chat">
						<il-chat-header username=${this.login.username}></il-chat-header>
						<ul
							@scroll="${(e) => {
								if (this.checkScrolledToBottom()) {
									this.renderRoot.querySelector(
										".scroll-button"
									).style.opacity = "0";
								} else if (
									this.renderRoot.querySelector(".scroll-button").style
										.opacity == 0
								) {
									this.renderRoot.querySelector(
										".scroll-button"
									).style.opacity = "1";
								}
							}}"
							class="message-box"
						>
							${this.messages.map(
								(item, _) =>
									html`
										<li
											class=${item.sender == this.login.username
												? "sender"
												: "receiver"}
										>
											<p class="receiver-name">
												${item.sender != this.login.username ? item.sender : ""}
											</p>
											<p class="message">
												${resolveMarkdown(
													MarkdownService.parseMarkdown(item.content)
												)}
											</p>
											<p class="message-timestamp">
												${new Date(item.timestamp).toLocaleTimeString([], {
													hour: "2-digit",
													minute: "2-digit",
												})}
											</p>
										</li>
									`
							)}
						</ul>
						<il-button-icon
							class="scroll-button"
							@click="${this.scrollToBottom}"
							content="${IconNames.scrollDownArrow}"
						></il-button-icon>

						<il-input-controls
							@send-message="${this.sendMessage}"
						></il-input-controls>
					</div>
				</section>
			</main>
		`;
	}

	async firstUpdated() {
		MessagesService.getMessagesById(
			this.login.username,
			this.login.password,
			"general"
		).then((messages) => {
			this.messages = messages.data.reverse();
		});
	}

	updateMessages(e) {
		// not working beacuse is not the child
		MessagesService.getMessagesById(
			this.login.username,
			this.login.password,
			e.detail.roomId
		).then((messages) => {
			this.messages = messages.data.reverse();
		});
	}

	updated() {
		this.scrollToBottom();
	}

	createSocket() {
		let basicAuth = window.btoa(
			this.login.username + ":" + this.login.password
		);

		const socket = new SockJS("chat?access_token=" + basicAuth.toString());
		this.stompClient = Stomp.over(socket);

		let headers = {};
		headers[this.login.headerName] = this.login.token;
		this.stompClient.connect(
			headers,
			() => this.onConnect(),
			() => this.onError()
		);
	}

	checkScrolledToBottom() {
		try {
			let element = this.renderRoot.querySelector("ul.message-box");
			return (
				element.scrollHeight - element.offsetHeight <= element.scrollTop + 10
			);
		} catch (error) {
			return false;
		}
	}

	scrollToBottom() {
		let element = this.renderRoot.querySelector("ul.message-box");
		element.scrollBy({ top: element.scrollHeight - element.offsetHeight });
	}

	onConnect() {
		this.stompClient.subscribe("/topic/public", (payload) =>
			this.onMessage(payload)
		);

		this.stompClient.send(
			"/app/chat.register",
			{},
			JSON.stringify({ sender: this.login.username, type: "JOIN" })
		);
	}

	onMessage(payload) {
		var message = JSON.parse(payload.body);

		if (message.content) {
			this.messages.push(message);
			this.update();
			this.updated();
			this.scrollToBottom();
			let sidebar = this.renderRoot.querySelector(
				"main > section > il-sidebar"
			);
			sidebar.shadowRoot.querySelector("div > il-conversation-list").setList();
		}
	}

	sendMessage(e) {
		this.message = e.detail.message;
		let messageContent = this.message.trim();

		if (messageContent && this.stompClient) {
			const chatMessage = {
				sender: this.login.username,
				content: messageContent,
				type: "CHAT",
			};

			this.stompClient.send("/app/chat.send", {}, JSON.stringify(chatMessage));
		}
	}

	onError(error) {
		console.log(error);
	}
}

customElements.define("il-chat", Chat);
