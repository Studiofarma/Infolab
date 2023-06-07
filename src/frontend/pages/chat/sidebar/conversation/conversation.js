import { LitElement, html, css } from "lit";
import { resolveMarkdown } from "lit-markdown";

import { MarkdownService } from "../../../../services/markdown-services";
import { CookieService } from "../../../../services/cookie-service";

import "../../../../components/icon";
import { IconNames } from "../../../../enums/icon-names";

class Conversation extends LitElement {
	static properties = {
		chat: {},
	};

	static styles = css`
		* {
			box-sizing: border-box;
			margin: 0;
			padding: 0;
		}
		.chat-box {
			display: flex;
			gap: 12px;
			align-items: flex-start;

			padding: 12px 12px;
			cursor: pointer;
			transition: 0.5s;
		}

		.date-box {
			margin-left: auto;
			text-align: right;
		}

		.unread-counter {
			display: flex;
			justify-content: flex-end;
		}

		.last-message {
			color: #bcbec2;
		}

		.last-message-timestamp {
			color: #bcbec2;
		}

		il-icon {
			border-radius: 50%;
			display: flex;
			height: 24px;
			width: 25px;
			color: rgb(13, 162, 255);
		}

		span {
			border-radius: 50%;
			background-color: #e7f3ff;
			height: 25px;
			width: 25px;
			grid-area: unread;
			color: #083c72;
			text-align: center;
			vertical-align: middle;
			line-height: 1.5;
		}
	`;

	render() {
		if (this.chat.unread === 0) {
			this.notificationOpacity = "none";
		} else {
			this.notificationOpacity = "block";
		}

		let timestamp = new Date(
			this.chat.lastMessage.timestamp
		).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

		return html`
			<div class="chat-box">
				<il-avatar
					.avatarLink=${this.chat.avatarLink}
					.name=${this.chat.name}
					.id=${this.chat.id}
				></il-avatar>
				<div class="name-box">
					<p class="chat-name">${this.chatNameFormatter(this.chat.name)}</p>
					<p class="last-message">
						${this.lastMessageTextFormatter(
							this.chat.lastMessage.sender,
							this.chat.lastMessage.preview
						)}
					</p>
				</div>
				<div class="date-box">
					<p
						class="last-message-timestamp"
						style="${this.chat.unread > 0 ? "color:rgb(58 179 255)" : ""}"
					>
						${timestamp}
					</p>
					<p class="unread-counter">
						${this.chat.unread > 0
							? html`
									<il-icon
										style="display:${this.notificationOpacity};"
										name="${this.getUnreadIconName(this.chat.unread)}"
									></il-icon>
							  `
							: html``}
					</p>
				</div>
			</div>
		`;
	}

	chatNameFormatter(chatName) {
		let cookie = CookieService.getCookie();
		if (chatName.includes("-")) {
			chatName = chatName.split("-");
			chatName.splice(chatName.indexOf(cookie.username), 1);
		}
		return chatName;
	}

	lastMessageTextFormatter(sender, message) {
		return resolveMarkdown(
			MarkdownService.parseMarkdown(
				this.fixLastMessageLength(`${sender}: ${message}`)
			)
		);
	}

	fixLastMessageLength(message) {
		let maxLength = 20;
		if (message.length > maxLength) {
			message = message.substring(0, maxLength);
			message += "...";
		}

		return message;
	}

	getUnreadIconName(unread) {
		switch (unread) {
			case 1:
				return IconNames.numeric1;

			case 2:
				return IconNames.numeric2;

			case 3:
				return IconNames.numeric3;

			case 4:
				return IconNames.numeric4;

			case 5:
				return IconNames.numeric5;

			case 6:
				return IconNames.numeric6;

			case 7:
				return IconNames.numeric7;

			case 8:
				return IconNames.numeric8;

			case 9:
				return IconNames.numeric9;

			default:
				return IconNames.numericPlus;
		}
	}
}

customElements.define("il-conversation", Conversation);
