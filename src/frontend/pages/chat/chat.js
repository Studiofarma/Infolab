import { LitElement, html, css } from "lit";
import SockJS from "sockjs-client";
import Stomp from "stompjs";

import "../../components/button-icon";
import "./search-chats.js";
import "./chats-list.js";
import "./input-controls.js";

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
      background: #d3d3d3;
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

    .sidebar {
      background: #003366;
      color: white;
      padding-top: 10px;
      display: flex;
      flex-direction: column;
      border-right: 3px solid #0064a6;
    }

    .chat {
      position: relative;
      padding-top: 100px;
      padding-left: 5vw;
      padding-right: 5vw;
    }

    .chatHeader {
      position: absolute;
      background: #0074bc;
      top: 0px;
      left: 0px;
      width: 100%;
      min-height: 50px;
      padding: 8px 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: white;
    }

    .chatHeader .settings {
      order: 2;
      display: flex;
    }

    .chatHeader .contact {
      order: 1;
      display: flex;
      gap: 1em;
    }

    .messageBox {
      list-style-type: none;
      display: flex;
      align-items: flex-end;
      flex-direction: column;
      gap: 30px;
    }

    .messageBox li {
      position: relative;
      min-width: 300px;
      padding: 15px 8px;
      background: #f2f4f7;
      border-radius: 10px 10px 0 10px;
      box-shadow: 0 0 10px #989a9d;
    }

    .messageBox li::after {
      content: "";
      position: absolute;
      transform: translate(-50%, -50%);
      bottom: -15px;
      right: -5px;
      border-top: 10px solid #f2f4f7;
      border-left: 10px solid transparent;
      border-right: 0px solid transparent;
    }

    .messageBox li::before {
      content: "";
      position: absolute;
      transform: translate(-50%, -50%);
      bottom: -13px;
      right: -8px;
      border-top: 10px solid #989a9d;
      border-left: 10px solid transparent;
      border-right: 0px solid transparent;
      filter: blur(10px);
    }

    * {
      font-family: inherit;
    }

    @keyframes rotationAnim {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    #settingsIcon:hover {
      animation: rotationAnim 2s infinite linear;
    }

    :not(.dropdown)::-webkit-scrollbar {
      background-color: #0074bc;
      border-radius: 10px;
      border: 5px solid #003366;
    }

    :not(.dropdown)::-webkit-scrollbar-thumb {
      background-color: #0da2ff;
      border-radius: 10px;
      width: 5px;
      border: 3px solid #003366;
    }
  `;

  render() {
    //aggiungo il main e lo metto in absolute per non andare in display flex che avevo messo per il login
    return html`
      <main>
        <header></header>

        <section>
          <div class="sidebar">
            <il-search></il-search>
            <il-chats-list></il-chats-list>
          </div>

          <div class="chat">
            <div class="chatHeader">
              <div class="settings">
                <il-button-icon
                  content="settings"
                  id="settingsIcon"
                ></il-button-icon>
              </div>

              <div class="contact">
                <h2>ChatBox ${this.login.username}</h2>
              </div>
            </div>

            <ul class="messageBox">
              ${this.messages.map((item, _) => html` <li>${item}</li> `)}
            </ul>

            <il-input-controls></il-input-controls>
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
}

customElements.define("il-chat", Chat);
