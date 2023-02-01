import { LitElement, html, css } from "lit";

class ConversationList extends LitElement {
  static properties = {
    chatsList: { state: true },
  };

  static styles = css`
    * {
      box-sizing: border-box;
      padding: 0;
      margin: 0;
    }

    .pharmaciesList {
      overflow-y: auto !important;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .pharmaciesList > div {
      width: 100%;
      min-height: 60px;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 12px;
      cursor: pointer;
      transition: 0.5s;
    }

    .pharmaciesList > div:hover {
      background-color: #00234f;
    }

    .pharmaciesList {
      transition: 0.5s;
      overflow-y: scroll;
      height: 82vh;
    }

    .avatar {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: lightgray;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .pharmaciesList .name {
      font-size: 15pt;
      max-width: 200px;
      overflow-x: hidden;
      text-overflow: ellipsis;
    }

    ::-webkit-scrollbar {
      background-color: #0074bc;
      border-radius: 10px;
      border: 5px solid #003366;
    }

    ::-webkit-scrollbar-thumb {
      background-color: #0da2ff;
      border-radius: 10px;
      width: 5px;
      border: 3px solid #003366;
    }
  `;

  constructor() {
    super();
    this.chatsList = [{ name: "chatBox user1", avatar: "#" }];
  }

  render() {
    return html`
      <div class="pharmaciesList">
        ${this.chatsList.map(
          (chat) => html`
            <div>
              <div class="avatar">
                <img src=${chat.avatar} />
              </div>
              <p class="name">${chat.name}</p>
            </div>
          `
        )}
      </div>
    `;
  }
}

customElements.define("il-chats-list", ConversationList);
