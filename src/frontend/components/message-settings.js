import { LitElement, html, css } from "lit";

import { IconNames } from "../enums/icon-names.js";

import "./button-icon.js";
import "./icon.js";
import "./message-menu-option.js";

export class MessageSettings extends LitElement {

	static styles = css`
	
		dialog {
			width: fit-content;
			border: none;
			outline: none;
			border-radius: 6px;
			box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
		}

		dialog::backdrop {
			background-color: transparent;
		}
	`


	render() {
		return html`
			<dialog @click=${this.closeDialog} @mouseleave=${this.closeDialog}>
				<message-menu-option iconName=${IconNames.mdiContentCopy} text="Copia">
				</message-menu-option>

				<message-menu-option iconName=${IconNames.mdiShare} text="Inoltra">
				</message-menu-option>

				<message-menu-option
					iconName=${IconNames.mdiMessage}
					text="Scrivi in privato"
				>
				</message-menu-option>

				<message-menu-option iconName=${IconNames.mdiDelete} text="Elimina">
				</message-menu-option>
			</dialog>
		`;
	}

	openDialog() {
		let dialog = this.renderRoot.querySelector("dialog");
		dialog.show();
	}

	closeDialog() {
		let dialog = this.renderRoot.querySelector("dialog");
		dialog.close()
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
