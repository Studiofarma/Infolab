import { LitElement, html, css } from "lit";

import { IconNames } from "../enums/icon-names.js";

import "./button-icon.js";
import "./icon.js";
import "./message-menu-option.js"

export class MessageSettings extends LitElement {
	static properties = {
		openSettings: { state: true, type: Boolean },
		message: { type: Object },
		cookie: { type: Object },
		index: { type: Number },
	};

	constructor() {
		super();
		this.openSettings = false;
	}

	static styles = css`
		:host {
			color: black;
			position: absolute;
			top: 50%;
			transform: translate(0, -50%);
			background: white;
			border-radius: 6px;
			box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
		}

		il-button-icon {
			display: flex;
			justify-content: center;
			align-items: center;
		}

		.menu-options {
			padding: 5px;
		}

	`;

	render() {
		return html`
			<div class="message-settings">
				<il-button-icon
					@click=${() => this.setOpenSettings(true)}
					content="${IconNames.dotsHorizontal}"
					color="black"
				>
				</il-button-icon>

				<div class="menu-options" style="display: none">
				
        <message-menu-option 
          iconName=${IconNames.mdiContentCopy}
          text="Copia"
        >
        </message-menu-option>
				
        <message-menu-option 
          iconName=${IconNames.mdiShare}
          text="Inoltra"
        >
        </message-menu-option>
				
        <message-menu-option 
          iconName=${IconNames.mdiMessage}
          text="Scrivi in privato"
        >
        </message-menu-option>
				
        <message-menu-option 
          iconName=${IconNames.mdiDelete}
          text="Elimina"
        >
        </message-menu-option>
				




        </div>
			</div>
		`;
	}

	willUpdate(changedProperties) {
		if (changedProperties.has("openSettings") && this.openSettings) {
			let messageContainer = document
				.querySelector("il-app")
				.shadowRoot.querySelector("il-chat")
				.shadowRoot.querySelectorAll("il-message")
				[this.index].shadowRoot.querySelector(".container");

			let messageSettings = document
				.querySelector("il-app")
				.shadowRoot.querySelector("il-chat")
				.shadowRoot.querySelectorAll("il-message")
				[this.index].shadowRoot.querySelector("il-message-settings");

			messageSettings.style.top = "100%";

			if (messageContainer.classList.contains("sender")) {
				messageSettings.style.left = "-160px";
				return;
			}

			if (messageContainer.classList.contains("receiver")) {
				messageSettings.style.right = "-160px";
				return;
			}
		}

		if (changedProperties.has("openSettings") && !this.openSettings) {
			let messageContainer = document
				.querySelector("il-app")
				.shadowRoot.querySelector("il-chat")
				.shadowRoot.querySelectorAll("il-message")
				[this.index].shadowRoot.querySelector(".container");

			let messageSettings = document
				.querySelector("il-app")
				.shadowRoot.querySelector("il-chat")
				.shadowRoot.querySelectorAll("il-message")
				[this.index].shadowRoot.querySelector("il-message-settings");

			messageSettings.style.top = "50%";

			if (messageContainer.classList.contains("sender")) {
				messageSettings.style.left = "-40px";
				return;
			}

			if (messageContainer.classList.contains("receiver")) {
				messageSettings.style.right = "-40px";
				return;
			}
		}
	}

	setOpenSettings(b) {
		let menuOptions = this.renderRoot.querySelector(".menu-options");
		let buttonIcon = this.renderRoot.querySelector("il-button-icon");

		if (b) {
			menuOptions.style.display = "block";
			buttonIcon.style.display = "none";
		} // chiusura non ancora predisposta

		this.openSettings = b;
	}

	copyToClipboard(text) {
		navigator.clipboard.writeText(text);
	}

	forwardMessage(message) {
		let forwardListElement = document
			.querySelector("body > il-app")
			.shadowRoot.querySelector("il-chat")
			.shadowRoot.querySelector("main > section > div > il-forward-list");

		let e = { message: message };

		forwardListElement.forwardMessageHandler(e);
	}

	goToChat(roomName) {
		let conversationList = document
			.querySelector("body > il-app")
			.shadowRoot.querySelector("il-chat")
			.shadowRoot.querySelector("main > section > il-sidebar")
			.shadowRoot.querySelector("div > il-conversation-list");

		conversationList.selectChat(roomName);
	}

	deleteMessage(message) {
		let chatElement = document
			.querySelector("body > il-app")
			.shadowRoot.querySelector("il-chat");

		chatElement.messages.splice(this.messages.indexOf(message), 1);
		chatElement.update();
	}
}

customElements.define("il-message-settings", MessageSettings);
