import { LitElement, html, css } from "lit";

import "../../../../components/icon";
import { IconNames } from "../../../../enums/icon-names";

class Conversation extends LitElement {
  static properties = {
    chat: {},
  };

  static styles = css`
    div {
      display: grid;
      gap: 10px;
      padding: 8px 12px;
      cursor: pointer;
      transition: 0.5s;
      grid-template-areas: "avatar nome nome nome" "avatar messaggio messaggio notifiche";
      grid-template-columns: 50px;
      grid-template-rows: 2fr 1fr;
    }

    div > p {
      text-align: left;
    }

    div:hover {
      background-color: #00234f;
    }

    p {
      margin: 0px;
    }

    .name {
      grid-area: nome;
    }

    .lastMessage {
      grid-area: messaggio;
      font-size: 0.7em;
    }

    il-avatar {
      grid-area: avatar;
    }

    il-icon {
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

    #unread {
      display: grid;
      grid-template-areas: "null  null unread";
      grid-template-columns: 1fr 1fr 25px;
    }
  `;

  render() {
    if (this.chat.unread === 0) {
      this.notificationOpacity = "none";
    } else {
      this.notificationOpacity = "block";
    }

    return html`
      <div>
        <il-avatar .chat=${this.chat}></il-avatar>
        <p class="name">${this.chat.name}</p>
        <p class="lastMessage">${this.chat.lastMessage}</p>

        <p id="unread">
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
    `;
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
