import { LitElement, html, css } from "lit";
import '../../components/avatar.js'
import './conversation.js'

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

    
    .pharmaciesList {
      transition: 0.5s;
      overflow-y: scroll;
      height: 82vh;
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
    this.chatsList = [{ name: "chatBox user1", avatar: "#" } ];
  }

  render() {
    return html`
      <div class="pharmaciesList">
        ${this.chatsList.map(
          (chat) => html`
           <il-conversation name=${chat.name}></il-conversation>
          `
        )}
      </div>
    `;
  }
}

customElements.define("il-chats-list", ConversationList);
