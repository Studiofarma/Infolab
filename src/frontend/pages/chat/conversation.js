import { LitElement, html, css } from "lit";

class Conversation extends LitElement {
  static properties = {
    name: "",
    nameStr: { type: String, attribute: "name" },
    lastMessage: "",
  };

  static styles = css`
    div {
      min-height: 60px;
      display: grid;
      align-items: center;
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
  `;

  render() {
    return html`
      <div>
        <il-avatar></il-avatar>
        <p class="name">${this.name}</p>
        <p class="lastMessage">${this.lastMessage}</p>
      </div>
    `;
  }

  willUpdate(changedProperties) {
    if (changedProperties.has("nameStr")) this.name = this.nameStr;
  }
}

customElements.define("il-conversation", Conversation);
