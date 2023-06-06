import { LitElement, html, css } from "lit";

import { CookieService } from "../../../../services/cookie-service";
import { OpenChatsService } from "../../../../services/open-chats-service";

import "../../../../components/avatar.js";
import "./conversation.js";
import { ConversationDto } from "../../../../models/conversation-dto.js";

class ConversationList extends LitElement {
	static properties = {
		pharmaciesList: { state: true },
		activeChatId: { state: 0 },
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
		this.activeChatId = 0;
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

				this.pharmaciesList = tmp;
			})
			.catch((error) => {
				console.log(error);
			});
	}

	renderList() {
		return this.pharmaciesList.map((pharmacy) => {
			let conversation = new ConversationDto(pharmacy);
			return html`<il-conversation
				class=${conversation.id == this.activeChatId ? "active" : ""}
				.chat=${conversation}
				@click=${() => {
					this.activeChatId = conversation.id;
					this.updateMessages();
				}}
			></il-conversation>`;
		});
	}

	updateMessages() {
		this.dispatchEvent(
			new CustomEvent("update-message", {
				detail: {
					roomId: this.activeChatId,
				},
			})
		);
	}
}

customElements.define("il-conversation-list", ConversationList);
