import { LitElement, html, css } from "lit";
import * as mdi from "@mdi/js";
import "@jamescoyle/svg-icon";

class Conversation extends LitElement {
  static properties = {
    name: "",
    nameStr: { type: String, attribute: "name" },
    lastMessage: "",
    unread: 0,
    notificationopacity: 0,
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

    svg-icon {
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
    if (this.unread == 0) {
      this.notificationOpacity = "none";
    } else {
      this.notificationOpacity = "block";
    }

    return html`
      <div>
        <il-avatar></il-avatar>
        <p class="name">${this.name}</p>
        <p class="lastMessage">${this.lastMessage}</p>
        <p id="unread">
          <svg-icon
            style="display:${this.notificationOpacity};"
            type="mdi"
            path="${mdi[this.unread]}"
          ></svg-icon>
        </p>
      </div>
    `;
  }

  willUpdate(changedProperties) {
    if (changedProperties.has("nameStr")) this.name = this.nameStr;
  }
}

customElements.define("il-conversation", Conversation);
