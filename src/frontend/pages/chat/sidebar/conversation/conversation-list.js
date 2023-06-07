import { LitElement, html, css } from "lit";

import { CookieService } from "../../../../services/cookie-service";
import { OpenChatsService } from "../../../../services/open-chats-service";

import "../../../../components/avatar.js";
import "./conversation.js";
import { ConversationDto } from "../../../../models/conversation-dto.js";

class ConversationList extends LitElement {
	static properties = {
		pharmaciesList: { state: true },
		activeChatName: { state: "general" },
	};

	static styles = css`
		* {
			box-sizing: border-box;
			padding: 0;
			margin: 0;
		}

		.pharmaciesList {
			overflow-y: scroll;
			display: flex;
			height: auto;
			flex-direction: column;
			gap: 10px;
			height: calc(100vh - 70px);
		}

		::-webkit-scrollbar {
			width: 0px;
		}

		.active {
			background-color: #1460b1;
		}
	`;

	constructor() {
		super();
		this.pharmaciesList = [];
		this.setList();
		this.activeChatName = "general";
	}

	render() {
		return html` <div class="pharmaciesList">${this.renderList()}</div> `;
	}

	setList() {
		let tmp = [];
		let cookie = CookieService.getCookie();

		OpenChatsService.getOpenChats(cookie.username, cookie.password)
			.then((element) => {
				element["data"].forEach((pharmacy) => {
					tmp.push(pharmacy);
				});

				tmp.sort(this.compareTimestamp);
				this.pharmaciesList = tmp;
			})
			.catch((error) => {
				console.log(error);
			});
	}

	compareTimestamp(a, b) {
		var timestampA = Date.parse(a.lastMessage.timestamp);
		var timestampB = Date.parse(b.lastMessage.timestamp);
		return timestampB - timestampA;
	}

	renderList() {
		return this.pharmaciesList.map((pharmacy) => {
			let conversation = new ConversationDto(pharmacy);
			return html`<il-conversation
				class=${conversation.name == this.activeChatName ? "active" : ""}
				.chat=${conversation}
				@click=${() => {
					this.activeChatName = conversation.name;
					this.updateMessages(conversation.name);
				}}
			></il-conversation>`;
		});
	}

	updateMessages(roomName) {
		this.dispatchEvent(
			new CustomEvent("update-message", {
				detail: {
					roomName: roomName,
				},
				bubbles: true,
				composed: true,
			})
		);
	}
}

customElements.define("il-conversation-list", ConversationList);
