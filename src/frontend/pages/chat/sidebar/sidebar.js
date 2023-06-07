import { LitElement, html, css } from "lit";

import "./search-chats.js";
import "./conversation/conversation-list.js";
import "../../../components/avatar.js";

export class Sidebar extends LitElement {
	static properties = {
		login: {
			username: "",
			password: "",
			headerName: "",
			token: "",
		},
	};

	static styles = css`
		.side-bar {
			background: #083c72;
			color: white;

			display: flex;
			flex-direction: column;
			height: 100vh;
			width: 350px;
			z-index: 1100;

			box-shadow: rgb(0 0 0 / 40%) 0px 0px 11px 0.2px;
		}

		.search,
		.profile-box {
			flex: 0 0 auto;
		}

		.profile-box {
			position: relative;
			display: flex;
			align-items: center;
			gap: 20px;
			border-top: 1px solid black;
			cursor: pointer;
			transition: transform 0.5s;
		}

		.profile-box:hover {
			transform: translateY(-95px);
		}

		.profile-avatar {
			transition: transform 0.5s;
		}

		.profile-box:hover .profile-avatar {
			transform: scale(1.5);
		}

		.profile-tab-name {
			transition: opacity 0.5s;
		}

		.profile-box:hover .profile-tab-name {
			display: none;
		}

		.profile-username {
			opacity: 0;
		}

		.profile-box:hover .profile-username {
			opacity: 1;
		}

		.profile-info {
			position: absolute;
			background: #083c72;
			width: 100%;
			top: 70px;
		}

		.conversation-list {
			flex: 1 0 auto;
		}
	`;

	constructor() {
		super();
	}

	render() {
		return html`
			<div class="side-bar">
				<il-search
					class="search"
					@load-chat=${(e) => {
						this.loadChat(e);
					}}
				></il-search>
				<il-conversation-list class="conversation-list"></il-conversation-list>
				<div class="profile-box">
					<il-avatar
						class="profile-avatar"
						style="padding: 10px"
						.avatarLink=${""}
						.name=${this.login.username}
						.id=${0}
					></il-avatar>
					<p class="profile-tab-name">Profile</p>
					<p class="profile-username">${this.login.username}</p>
					<div class="profile-info">
						<h1>${this.login.username}</h1>
					</div>
				</div>
			</div>
		`;
	}

	loadChat(e) {
		this.shadowRoot
			.querySelector("il-conversation-list")
			.selectChat(e.detail.selectedChatName);
	}
}

customElements.define("il-sidebar", Sidebar);
