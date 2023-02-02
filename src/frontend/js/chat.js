import { LitElement, html, css } from "lit";
import "./button-icon.js";
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

  static styles = css`
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    main {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: white;
    }

    input[type="text"] {
      border: none;
      outline: none;
    }

    section {
      display: grid;
      grid-template-columns: 0.3fr 0.7fr;
      height: 100%;
    }

    .conversazioni {
      background: #013365;
      color: white;
      padding-top: 20px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      border-radius: 0 10px 10px 0;
      overflow-y: scroll;
    }

    .conversazioni > div:not(#searchChats) {
      width: 100%;
      min-height: 60px;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 12px;
      cursor: pointer;
      transition: 0.5s;
    }

    .conversazioni > div:not(#searchChats):hover {
      background-color: #00234f;
    }

    #searchChats {
      display: flex;
      align-items: center;
      justify-content: center;
      column-gap: 10px;
      margin: 0 10px;
    }

    #searchChats > input {
      width: 90%;
      height: 40px;
      border-radius: 10px;
      padding: 10px;
    }

    .conversazioni .avatar {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: lightgray;
    }

    .conversazioni .name {
      font-size: 10pt;
    }

    .chat {
      position: relative;
      padding-top: 60px;
      padding-left: 5vw;
      padding-right: 5vw;
    }

    .chatHeader {
      position: absolute;
      background: lightgray;
      top: 0px;
      left: 0px;
      width: 100%;
      padding: 8px 5px;
      display: flex;
      align-items: center;
    }

    .messageBox {
      list-style-type: none;
      display: flex;
      align-items: flex-end;
      flex-direction: column;
      gap: 10px;
    }

    .messageBox li {
      position: relative;
      min-width: 300px;
      padding: 15px 8px;
      background: aliceblue;
    }

    #inputControls {
      position: absolute;
      bottom: 0px;
      left: 0px;
      width: 100%;
      min-height: 60px;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 10px;
      background: lightgray;
    }

    #inputControls input[type="text"] {
      height: 50px;
      flex-basis: 90%;
      border-radius: 18px;
      padding: 5px 12px;
      font-size: 15pt;
    }

    #inputControls > * {
      flex-shrink: 1;
    }

    #inputControls .submitContainer {
      flex-basis: 10%;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .submitContainer il-button-icon {
      width: 40px;
      height: 40px;
      margin-top: 0px;
      border: none;
      border-radius: 50%;
      background: white;
      font-size: 20px;
      cursor: pointer;
    }

    * {
      font-family: inherit;
    }
  `;

  render() {
    //aggiungo il main e lo metto in absolute per non andare in display flex che avevo messo per il login
    return html`
      <main>
        <header></header>

        <section>
          <div class="conversazioni">
            <div id="searchChats">
              <input type="text" placeholder="cerca farmacie" />
              <il-button-icon content="search"></il-button-icon>
            </div>
            <div>
              <div class="avatar"></div>
              <p class="name">farmacia1</p>
            </div>

            <div>
              <div class="avatar"></div>
              <p class="name">farmacia2</p>
            </div>

            <div>
              <div class="avatar"></div>
              <p class="name">farmacia3</p>
            </div>
          </div>

          <div class="chat">
            <div class="chatHeader">
              <h2>ChatBox ${this.login.username}</h2>
            </div>

            <ul class="messageBox">
              ${this.messages.map((item, _) => html` <li>${item}</li> `)}
            </ul>

            <div id="inputControls">
              <input
                type="text"
                placeholder="Scrivi un messaggio..."
                @input=${this.onMessageInput}
                .value=${this.message}
              />
              <div class="submitContainer">
                <il-button-icon
                  @click=${this.sendMessage}
                  content="send"
                  height="24px"
                ></il-button-icon>
              </div>
            </div>
          </div>
        </section>
      </main>
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
      () => this.onConnect(),
      () => this.onError()
    );
  }

  onConnect() {
    this.stompClient.subscribe("/topic/public", (payload) =>
      this.onMessage(payload)
    );

    this.stompClient.send(
      "/app/chat.register",
      {},
      JSON.stringify({ sender: this.login.username, type: "JOIN" })
    );
  }

  onMessage(payload) {
    var message = JSON.parse(payload.body);

    if (message.content) {
      this.messages.push(message.content);
      this.update();
    }
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
