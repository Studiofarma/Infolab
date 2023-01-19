import { LitElement, html } from "lit";
import SockJS from "sockjs-client";
import Stomp from "stompjs";

export class Chat extends LitElement {
  static properties = {
    message: "",
    messages: [],
    stompClient: {},
  };

  static get properties() {
    return {
      login: {
        username: "",
        password: "",
        headerName: "",
        token: "",
      },
    };
  }

  constructor() {
    super();
    this.message = "";
    this.messages = [];
  }
  connectedCallback() {
    super.connectedCallback();
    this.createSocket();
  }

  render() {
    return html`
      <h2>ChatBox ${this.login.username}</h2>
      <ul>
        ${this.messages.map((item, _) => html` <li>${item}</li> `)}
      </ul>
      <input
        type="text"
        placeholder="Scrivi un messaggio..."
        @input=${this.onMessageInput}
        .value=${this.message}
      />
      <button @click=${this.sendMessage}>Invia</button>
    `;
  }

  createSocket() {
    let basicAuth = window.btoa(
      this.login.username + ":" + this.login.password
    );

    const socket = new SockJS("chat?access_token=" + basicAuth.toString());
    this.stompClient = Stomp.over(socket);

    let headers = {};
    headers[this.login.headerName] = this.login.token;
    this.stompClient.connect(
      headers,
      () => {
        this.stompClient.subscribe("/topic/public", (payload) => {
          var message = JSON.parse(payload.body);

          if (message.content) {
            this.messages.push(message.content);
            this.update();
          }
        });

        this.stompClient.send(
          "/app/chat.register",
          {},
          JSON.stringify({ sender: this.login.username, type: "JOIN" })
        );
      },
      this.onError
    );
  }

  onError(error) {
    console.log(error);
  }

  onMessageInput(e) {
    const inputEl = e.target;
    this.message = inputEl.value;
  }

  sendMessage() {
    let messageContent = this.message.trim();

    if (messageContent && this.stompClient) {
      const chatMessage = {
        sender: this.login.username,
        content: messageContent,
        type: "CHAT",
      };

      this.stompClient.send("/app/chat.send", {}, JSON.stringify(chatMessage));
    }

    this.message = "";
  }
}

customElements.define("il-chat", Chat);
