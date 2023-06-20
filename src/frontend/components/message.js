import { LitElement, html, css } from "lit";

import { resolveMarkdown } from "lit-markdown";
import { MarkdownService } from "../services/markdown-services";

import { CookieService } from "../services/cookie-service";

import "./message-settings.js";

export class Message extends LitElement {
	static properties = {
		messages: { type: Array },
		message: { type: Object },
		index: { type: Number },
	};

	constructor() {
		super();
		this.cookie = CookieService.getCookie();
	}

	static styles = css`
		* {
			margin: 0;
			padding: 0;
		}

		.sender,
		.receiver {
			list-style-position: inside;
			position: relative;
			min-width: 300px;
			max-width: 500px;
			padding: 8px 8px 6px 10px;
			box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
			z-index: 3;
		}

		.sender .message > p::selection {
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
			justify-self: flex-end;
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

		.sender a:link {
			color: black;
		}

		.sender a:visited {
			color: black;
		}

		.sender a:hover {
			color: white;
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

		.sender il-message-settings {
			left: -40px;
		}

		.receiver il-message-settings {
			right: -40px;
		}

		il-message-settings {
			opacity: 0;
			transition:  opacity 0.5s;
		}

		div:hover il-message-settings {
			opacity: 1;
		}

		.message-date {
			justify-self: center;
			padding: 5px;
			border-radius: 6px;
			background-color: rgb(221, 221, 221);
		}
	`;

	render() {
		return html`
			${this.compareMessageDate(
				this.messages[this.index - 1]?.timestamp,
				this.message.timestamp
			)}

			<div
				class=${
					this.message.sender == this.cookie.username
						? "sender container"
						: "receiver container" //la classe container è solo un riferimento per il-message-settings
				}
			>
				<p class="receiver-name">
					${this.message.sender != this.cookie.username
						? this.message.sender
						: ""}
				</p>
				<p class="message">
					${resolveMarkdown(
						MarkdownService.parseMarkdown(this.message.content)
					)}
				</p>
				<p class="message-timestamp">
					${new Date(this.message.timestamp).toLocaleTimeString([], {
						hour: "2-digit",
						minute: "2-digit",
					})}
				</p>

				<il-message-settings
					.message=${this.message}
					.cookie=${this.cookie}
					.index=${this.index}
				>
				</il-message-settings>
			</div>
		`;
	}

	compareMessageDate(messageDate1, messageDate2) {
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
}

customElements.define("il-message", Message);
