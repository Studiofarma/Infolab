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
		return html` <div class="conversation-list">${this.renderList()}</div> `;
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

	formaLists(list1, list2) {
		let concatLists = [];
		list1 = list1.filter((element) => {
			return !list2.some((element2) => element2.roomName === element.roomName);
		});

		concatLists = concatLists.concat(list1);

		list2 = list2.filter((obj) => obj.roomName.includes(this.query));
		concatLists = concatLists.concat(list2);

		return concatLists;
	}

	renderList() {
		let conversationListAndSearched = this.formaLists(
			this.conversationSearched,
			this.conversationList
		);

		return conversationListAndSearched.map((pharmacy) => {
			let conversation = new ConversationDto(pharmacy);
			return html`<il-conversation
				class=${"conversation " +
				(conversation.name == this.activeChatName ? "active" : "")}
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
