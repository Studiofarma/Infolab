import { LitElement, html, css } from "lit";

import "./icon";
import { ConversationDto } from "./../models/conversation-dto";

export class ButtonIcon extends LitElement {
	static get properties() {
		return {
			content: "",
		};
	}

  static styles = css`
    :host {
      display: flex;
      align-items: center;
    }

		.icon-button {
			height: 100%;
			width: 100%;
			display: flex;
			justify-content: center;
			align-items: center;
			font-size: 0px;
			-webkit-font-smoothing: antialiased;
			cursor: pointer;
			user-select: none;
		}

		.icon-button:hover {
			color: white;
		}
	`;

	render() {
		return html`
			<div class="icon-button">
				<il-icon name="${this.content}"></il-icon>
			</div>
		`;
	}
}

customElements.define("il-button-icon", ButtonIcon);
