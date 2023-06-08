import { LitElement, html, css } from "lit";

import { CookieService } from "../../../../services/cookie-service";
import { OpenChatsService } from "../../../../services/open-chats-service";

import "../../../../components/avatar.js";
import "./conversation.js";
import { ConversationDto } from "../../../../models/conversation-dto.js";

class ConversationList extends LitElement {
	static properties = {
		conversationList: { state: true },
		activeChatName: { state: "general" },
	};

	static styles = css`
		* {
			box-sizing: border-box;
			padding: 0;
			margin: 0;
		}

		.conversation-list {
			overflow-y: scroll;
			display: flex;
			height: auto;
			flex-direction: column;
			gap: 10px;
			margin-right: 3px;
		}

		::-webkit-scrollbar {
			width: 4px;
			margin-right: 10px;
		}

		::-webkit-scrollbar-track {
			background-color: none;
		}

		::-webkit-scrollbar-thumb {
			border-radius: 10px;
			background-color: rgb(54, 123, 251);
		}

		.conversation {
			margin-right: 3px;
			border-radius: 0px 7px 7px 0px;
			transition: background-color 0.2s;
		}

		.conversation:hover {
			background-color: #1460b1;
		}

		.active {
			background-color: #1460b1;
		}

		.separator {
			padding: 5px 0px 5px 10px;
			color: #d6d6d6;
		}
	`;

	constructor() {
		super();
		this.query = "";
		this.conversationList = [];
		this.conversationSearched = [];
		this.setList();

		this.activeChatName = "general";
	}

	render() {
		return html`
			<p class="separator">
				${this.renderConversationSearched().length > 0 ? "New Chat" : ""}
			</p>
			<div class="conversation-list">${this.renderConversationSearched()}</div>

			<p class="separator">Chat</p>
			<div class="conversation-list">${this.renderConversationList()}</div>
		`;
	}

	setListSearched(list, query) {
		let cookie = CookieService.getCookie();
		this.query = query;

		this.conversationSearched = [];

		list.forEach((element, index) => {
			list[index] = {
				avatarLink: null,
				roomName: this.chatNameRecomposer(cookie.username, element.name),
				unreadMessages: 0,
				lastMessage: {
					preview: null,
					sender: null,
					timestamp: null,
				},
			};
		});

		if (list.length > 0) {
			list.forEach((pharmacy) => {
				this.conversationSearched = list.filter((obj2) =>
					this.conversationSearched.some(
						(obj1) => obj1.roomName === obj2.roomName
					)
				);

				this.conversationSearched.unshift(pharmacy);
			});
		} else {
			this.conversationSearched = [];
		}
		this.update();
	}

	setList() {
		let cookie = CookieService.getCookie();

		OpenChatsService.getOpenChats(cookie.username, cookie.password)
			.then((element) => {
				element["data"].forEach((pharmacy) => {
					let isPresent = this.conversationList.some(
						(obj) => obj.roomName === pharmacy.roomName
					);
					if (!isPresent) {
						this.conversationList.unshift(pharmacy);
					} else {
						let index = this.conversationList.findIndex(
							(obj) => obj.roomName === pharmacy.roomName
						);
						this.conversationList[index] = pharmacy;
					}
				});

				this.conversationList.sort(this.compareTimestamp);
				this.update();
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

	formatLists(list1, list2) {
		list1 = list1.filter((element) => {
			return !list2.some((element2) => element2.roomName === element.roomName);
		});

		list2 = list2.filter((obj) => obj.roomName.includes(this.query));

		return [list1, list2];
	}

	renderConversationList() {
		let conversationList = this.formatLists(
			this.conversationSearched,
			this.conversationList
		)[1];

		return conversationList.map((pharmacy, index) => {
			let conversation = new ConversationDto(pharmacy);
			if (
				conversation.lastMessage.preview ||
				conversation.name == this.activeChatName
			) {
				return html`<il-conversation
					class=${"conversation " +
					(conversation.name == this.activeChatName ? "active" : "")}
					.chat=${conversation}
					@click=${() => {
						this.activeChatName = conversation.name;
						this.updateMessages(conversation.name);
						this.setList();
					}}
				></il-conversation>`;
			} else {
				this.conversationList.splice(index, 1);
			}
		});
	}

	renderConversationSearched() {
		let cookie = CookieService.getCookie();

		let conversationList = this.formatLists(
			this.conversationSearched,
			this.conversationList
		)[0];

		return conversationList.map((pharmacy) => {
			let conversation = new ConversationDto(pharmacy);
			return html`<il-conversation
				class=${"conversation new " +
				(conversation.name == this.activeChatName ? "active" : "")}
				.chat=${conversation}
				@click=${() => {
					this.updateListOnConversationClick(conversation);
				}}
			></il-conversation>`;
		});
	}

	updateListOnConversationClick(conversation) {
		this.setListSearched([], "");
		this.conversationList.unshift({
			avatarLink: null,
			roomName: conversation.name,

			unreadMessages: 0,
			lastMessage: {
				preview: null,
				sender: null,
				timestamp: null,
			},
		});
		this.activeChatName = conversation.name;
		this.updateMessages(conversation.name);
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
		let messagInput = document
			.querySelector("body > il-app")
			.shadowRoot.querySelector("il-chat")
			.shadowRoot.querySelector("main > section > div > il-input-controls")
			.shadowRoot.querySelector(
				"#inputControls > div.container > div > il-input-field"
			)
			.shadowRoot.querySelector("#message-input");

		messagInput.focus();
	}

	selectChat(selectedChatName) {
		let cookie = CookieService.getCookie();

		for (let conversation of this.conversationList) {
			if (this.chatNameFormatter(conversation.roomName) == selectedChatName) {
				this.activeChatName = conversation.roomName;
				this.updateMessages(this.activeChatName);
				return;
			}
		}

		selectedChatName = this.chatNameFormatter(
			selectedChatName,
			cookie.username
		);

		this.conversationList.push({
			avatarLink: null,
			roomName: selectedChatName,
			unreadMessages: 0,
			lastMessage: {
				preview: null,
				sender: null,
				timestamp: null,
			},
		});

		this.activeChatName = selectedChatName;
		this.updateMessages(this.activeChatName);

		this.update();
	}

	chatNameRecomposer(user1, user2) {
		let array = [user1, user2].sort();

		return array.join("-");
	}

	chatNameFormatter(chatName) {
		let cookie = CookieService.getCookie();
		if (chatName.includes("-")) {
			chatName = chatName.split("-");
			chatName.splice(chatName.indexOf(cookie.username), 1);
		}
		return chatName;
	}
}

customElements.define("il-conversation-list", ConversationList);
