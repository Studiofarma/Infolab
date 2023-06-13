import { LitElement, html, css } from "lit";

import { resolveMarkdown } from "lit-markdown";
import SockJS from "sockjs-client";
import Stomp from "stompjs";

import { MarkdownService } from "../../services/markdown-services";
import { MessagesService } from "../../services/messages-service";

import { CookieService } from "../../services/cookie-service";

import { IconNames } from "../../enums/icon-names";

import "../../components/button-icon";
import "../../components/forward-list";
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
			activeChatName: "",
		};
	}

	constructor() {
		super();
		this.messages = [];
		this.message = "";
		this.nMessages = 0;
		this.activeChatName = "general";
		this.forwardListVisibility = false;
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
			display: flex;
			flex-direction: column;
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
			display: grid;
			grid-auto-rows: max-content;
			gap: 30px;
			width: 100%;
			height: calc(100vh - 141px);
			overflow-y: auto;
			padding: 20px;
			margin-top: 71px;
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

		.message-box .sender .message > p::selection {
			color: black;
			background-color: white;
		}

		input {
			font-family: inherit;
		}

		.sender {
			justify-self: flex-end;
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
			justify-self: flex-start;
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

		.message-date {
			justify-self: center;
			padding: 5px;
			border-radius: 6px;
			background-color: rgb(221, 221, 221);
		}

		.message-box::-webkit-scrollbar {
			width: 4px;
			margin-right: 10px;
		}

		.message-box::-webkit-scrollbar-track {
			background-color: none;
		}

		.message-box::-webkit-scrollbar-thumb {
			border-radius: 10px;
			background-color: rgb(54, 123, 251);
			min-height: 40px;
		}

		.message-settings {
			opacity: 0;
			position: absolute;
			top: 50%;
			transform: translate(0, -50%);

			background: white;
			border-radius: 6px;
			box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
		}

		.sender .message-settings {
			color: black;
			left: -40px;
		}

		.receiver .message-settings {
			right: -40px;
		}

		.sender:hover .message-settings,
		.receiver:hover .message-settings {
			opacity: 1;
		}

		.message-settings:hover,
		.menu-options:hover .message-settings {
			opacity: 1;
		}

		.menu-options {
			display: none;
			top: -3px;
			width: max-content;

			padding: 5px;
		}

		.menu-options > p {
			cursor: pointer;
			padding: 2px;
			border-radius: 5px;
			user-select: none;
		}

		.menu-options > p:hover {
			background-color: #f5f5f5;
		}

		.message-settings:hover .menu-options {
			display: block !important;
		}

		.message-settings:hover il-button-icon {
			display: none !important;
		}
	`;

	render() {
		return html`
			<main>
				<section>
					<il-sidebar
						@update-message="${this.updateMessages}"
						.login=${this.login}
					></il-sidebar>
					<div class="chat">
						<il-chat-header
							userName=${this.login.username}
							roomName=${this.activeChatNameFormatter(this.activeChatName)}
						></il-chat-header>
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
								(item, index) =>
									html`
										${this.compareMessageDate(
											this.messages[this.messages.length - 1].timestamp,
											this.messages[index - 1]?.timestamp,
											item.timestamp
										)}

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
											<div class="message-settings">
												<il-button-icon
													content="${IconNames.dotsHorizontal}"
													@click=${() => {
														console.log("Opzioni pressed");
													}}
													styleProp="color: black;"
												>
												</il-button-icon>
												<div class="menu-options">
													<p
														@click=${() => {
															this.copyToClipboard(item.content);
														}}
													>
														Copia
													</p>
													<p
														@click=${() => {
															this.forwardMessage(item.content);
														}}
													>
														Inoltra
													</p>
													${item.sender != this.login.username
														? html`<p
																@click=${() => {
																	this.goToChat(item.sender);
																}}
														  >
																Scrivi in privato
														  </p>`
														: null}
													<p
														@click=${() => {
															this.deleteMessage(item);
															this.update();
														}}
													>
														Elimina
													</p>
												</div>
											</div>
										</li>
									`
							)}
						</ul>
						<il-forward-list></il-forward-list>

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

	forwardMessage(message) {
		let forwardListElement = document
			.querySelector("body > il-app")
			.shadowRoot.querySelector("il-chat")
			.shadowRoot.querySelector("main > section > div > il-forward-list");

		let e = { message: message };

		forwardListElement.forwardMessageHandler(e);
	}

	copyToClipboard(text) {
		navigator.clipboard.writeText(text);
	}

	deleteMessage(message) {
		console.log(message);
		this.messages.splice(this.messages.indexOf(message), 1);
	}

	goToChat(roomName) {
		let conversationList = document
			.querySelector("body > il-app")
			.shadowRoot.querySelector("il-chat")
			.shadowRoot.querySelector("main > section > il-sidebar")
			.shadowRoot.querySelector("div > il-conversation-list");

		conversationList.selectChat(roomName);
	}

	compareMessageDate(firstMessageDate, messageDate1, messageDate2) {
		const today = new Date().toDateString();
		const message = new Date(messageDate2).toDateString();

		if (
			new Date(messageDate1).toDateString() ==
			new Date(messageDate2).toDateString()
		) {
			return "";
		}

		if (today === message) {
			return html`<div class="message-date">Today</div>`;
		}

		const yesterday = new Date(today);
		yesterday.setDate(yesterday.getDate() - 1);

		if (yesterday.toDateString() === message) {
			return html`<div class="message-date">Yesterday</div>`;
		}

		const dayMonth = new Date(messageDate2).toLocaleDateString("default", {
			day: "2-digit",
			month: "long",
			year: "numeric",
		});
		return html`<div class="message-date">${dayMonth}</div>`;
	}

	async firstUpdated() {
		MessagesService.getMessagesById(
			this.login.username,
			this.login.password,
			"general"
		).then((messages) => {
			this.messages = messages.data.reverse();

			for (var i = 0; i < this.messages.length; i++) {
				this.messages[i].index = i;
			}
		});
	}

	async updateMessages(e) {
		MessagesService.getMessagesById(
			this.login.username,
			this.login.password,
			e.detail.roomName
		).then((messages) => {
			this.messages = messages.data.reverse();
		});

		this.activeChatName = e.detail.roomName;
	}

	async updated() {
		await setTimeout(() => {
			this.scrollToBottom();
		}, 20);
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
		element.scrollTo({ top: element.scrollHeight });
	}

	onConnect() {
		this.stompClient.subscribe("/topic/public", (payload) =>
			this.onMessage(payload)
		);

		// fixare questo
		this.stompClient.subscribe("/user/topic/me", (payload) =>
			this.onMessage(payload)
		);

		this.stompClient.subscribe(`/queue/${this.login.username}`, (payload) =>
			this.onMessage(payload)
		);

		this.stompClient.send(
			"/app/chat.register",
			{},
			JSON.stringify({ sender: this.login.username, type: "JOIN" })
		);
	}

	messageNotification(message) {
		if (!message.content || this.login.username === message.sender) {
			return;
		}

		let conversationList = document
			.querySelector("body > il-app")
			.shadowRoot.querySelector("il-chat")
			.shadowRoot.querySelector("main > section > il-sidebar")
			.shadowRoot.querySelector("div > il-conversation-list");

		let roomName = this.activeChatNameFormatter(message.roomName);

		if (Notification.permission === "granted") {
			let notification = new Notification(roomName, {
				body: message.content,
			});

			notification.onclick = function () {
				conversationList.selectChat(roomName);
				window.focus("/");
			};
		} else if (Notification.permission !== "denied") {
			Notification.requestPermission().then(function (permission) {
				if (permission === "granted") {
					let notification = new Notification(roomName, {
						body: message.content,
					});

					notification.onclick = function () {
						conversationList.selectChat(
							this.activeChatNameFormatter(message.roomName)
						);
						window.focus("/");
					};
				}
			});
		}
	}

	onMessage(payload) {
		let message = JSON.parse(payload.body);
		if (message.content) {
			if (this.activeChatName == message.roomName) {
				this.messages.push(message);
				this.update();
				this.updated();
			}
			let sidebar = this.renderRoot.querySelector(
				"main > section > il-sidebar"
			);
			sidebar.shadowRoot
				.querySelector("div > il-conversation-list")
				.setList(message);

			let conversationListElement = document
				.querySelector("body > il-app")
				.shadowRoot.querySelector("il-chat")
				.shadowRoot.querySelector("main > section > il-sidebar")
				.shadowRoot.querySelector("div > il-conversation-list");

			let room = conversationListElement.convertUserToRoom(message.roomName);
			conversationListElement.onMessageInNewChat(room, message);
		}

		this.messageNotification(message);
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

			let activeChatName = this.activeChatNameFormatter(this.activeChatName);

			this.stompClient.send(
				`/app/chat.send${
					activeChatName != "general" ? `.${activeChatName}` : ""
				}`,
				{},
				JSON.stringify(chatMessage)
			);
		}
	}

	onError(error) {
		console.log(error);
	}

	activeChatNameFormatter(activeChatName) {
		let cookie = CookieService.getCookie();
		if (activeChatName.includes("-")) {
			activeChatName = activeChatName.split("-");
			activeChatName.splice(activeChatName.indexOf(cookie.username), 1);
			return activeChatName[0];
		}
		return activeChatName;
	}
}

customElements.define("il-chat", Chat);
