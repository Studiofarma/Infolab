import { LitElement, html, css } from "lit";

import { CookieService } from "../../../services/cookie-service";
import { UsersService } from "../../../services/users-service";

import "../../../components/button-icon";
import { IconNames } from "../../../enums/icon-names";

export class SearchChats extends LitElement {
	static properties = {
		pharmaciesList: { state: true },
		query: {},
	};

	static styles = css`
		* {
			box-sizing: border-box;
			margin: 0;
			padding: 0;
		}

		.search-chats {
			width: 100%;
			padding: 15px 10px 10px;
			margin-bottom: 20px;
			column-gap: 10px;
			position: relative;
		}

		.container-input {
			position: relative;
			display: flex;
		}

		.search-icon {
			color: #b6b5b5;
			transition: 0.4s;
			width: 30px;
		}

		.search-input {
			width: 100%;
			height: 40px;
			border-radius: 10px;
			padding: 10px;
			border: none;
			outline: none;
			color: white;
			background-color: rgb(0, 38, 78);
			position: relative;
			overflow: hidden;
		}

		.search-input::placeholder {
			color: #b6b5b5;
		}

		.search-icon {
			width: 30px;
			animation: showElement 0.5s forwards;
		}

		.search-input:focus {
			width: 100%;
			transition: width 0.5s;
		}

		.search-input:focus ~ .dropdown {
			max-height: 325px;
			margin-top: 3px;
			overflow-y: auto;
		}

		.search-input:focus ~ .search-icon {
			animation: hideElement 0.5s forwards;
		}

		@keyframes hideElement {
			0% {
				opacity: 1;
				width: 30px;
			}

			100% {
				opacity: 0;
				width: 0;
			}
		}

		@keyframes showElement {
			0% {
				opacity: 0;
				width: 0;
			}

			100% {
				opacity: 1;
				width: 30px;
			}
		}

		.search-input {
			font-family: inherit;
		}

		.dropdown {
			display: none;
			position: absolute;
			top: 39px;
			left: 0px;
			width: 100%;
			background: white;
			z-index: 4;
			color: black;
			font-weight: 200;
			max-height: 0px;
			overflow-y: hidden;
			transition: 0.5s;
			text-align: center;
		}

		.dropdown::-webkit-scrollbar {
			background: lightgray;
			border-radius: 10px;
			width: 5px;
		}

		.dropdown::-webkit-scrollbar-thumb {
			background: gray;
			width: 1px;
			height: 1px;
		}

		.dropdown > div {
			min-height: 60px;
			padding: 8px 10px;
			font-weight: 400;
			transition: 0.5s;
			cursor: pointer;
			display: flex;
			align-items: center;
			gap: 1em;
		}

		.dropdown p {
			overflow-x: hidden;
			white-space: nowrap;
			text-overflow: ellipsis;
			max-width: calc(100% - 80px);
		}

		.dropdown .nofound {
			color: gray;
			font-size: 10pt;
			align-self: center;
			font-weight: lighter;
		}

		.dropdown > div:hover {
			background: lightgray;
		}
	`;

	constructor() {
		super();
		this.pharmaciesList = [];
		this.query = "";
	}

	render() {
		return html`
			<div class="search-chats">
				<div class="container-input">
					<input
						class="search-input"
						type="text"
						placeholder="cerca farmacie"
						@input=${this.setFilter}
						@click=${this.setFilter}
					/>
					<il-button-icon
						class="search-icon"
						content=${IconNames.magnify}
					></il-button-icon>

					<div class="dropdown">${this.showTips()}</div>
				</div>
			</div>
		`;
	}

	setFilter(event) {
		this.query = event.target.value.toLowerCase();
		this.pharmaciesList = [];
		let temp = [];
		let cookie = CookieService.getCookie();

		if (this.query.length >= 1) {
			UsersService.GetUsers(this.query, cookie.username, cookie.password).then(
				(element) => {
					element["data"].forEach((element) => {
						if (element.name != cookie.username) {
							temp.push(element);
						}
					});
					this.pharmaciesList = temp;

					this.populateConversationListWithUsers(this.pharmaciesList);
				}
			);
		} else {
			this.populateConversationListWithUsers([]);
		}
	}

	populateConversationListWithUsers(pharmacyNames) {
		let conversationList = document
			.querySelector("body > il-app")
			.shadowRoot.querySelector("il-chat")
			.shadowRoot.querySelector("main > section > il-sidebar")
			.shadowRoot.querySelector("div > il-conversation-list");

		conversationList.setListSearched(pharmacyNames, this.query);
	}

	showTips() {
		if (this.pharmaciesList.length > 0) {
			return this.pharmaciesList.map(
				(pharmacy) => html`
					<div
						@click=${() => {
							this.loadChat(pharmacy.name);
						}}
					>
						<p>${pharmacy.name}</p>
					</div>
				`
			);
		} else {
			return html`<div><p class="nofound">Nessun risultato trovato</p></div>`;
		}
	}

	loadChat(selectedChatName) {
		this.dispatchEvent(
			new CustomEvent("load-chat", {
				detail: {
					selectedChatName: selectedChatName,
				},
				bubbles: true,
				composed: true,
			})
		);
	}
}

customElements.define("il-search", SearchChats);
