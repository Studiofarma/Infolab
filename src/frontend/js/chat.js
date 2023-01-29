import { LitElement, html, css } from "lit";
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

    .conversazioni {
      background: #003366;
      color: white;
      padding-top: 10px;
      display: flex;
      flex-direction: column;
      /* overflow-y: scroll;  */
      border-right: 3px solid #0064a6;
    }

    .elencoFarmacie {
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .conversazioni > .elencoFarmacie > div {
      width: 100%;
      min-height: 60px;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 12px;
      cursor: pointer;
      transition: 0.5s;
    }

    .conversazioni > .elencoFarmacie > div:hover {
      background-color: #00234f;
    }

    #searchChats {
      width: 100%;
      padding: 5px 20px;
      margin-bottom: 50px;
      column-gap: 10px;
      position: relative;
    }

    #searchChats input {
      width: 100%;
      height: 40px;
      border-radius: 10px;
      padding: 10px;
    }

    #searchChats .dropdown {
      position: absolute;
      top: 39px;
      left: 0px;
      width: 100%;
      background: white;
      z-index: 4;
      color: black;
      font-weight: 200;
      height: 0px;
      overflow-y: hidden;
      transition: 0.5s;
      text-align: center;
    }

    #searchChats input:focus {
      border-bottom-left-radius: 0px;
      border-bottom-right-radius: 0px;
    }

    #searchChats input:focus ~ .dropdown {
      height: calc(3 * 60px);
      margin-top: 3px;
      border-bottom-left-radius: 10px;
      border-bottom-right-radius: 10px;
    }

    .dropdown p {
      min-height: 60px;
      padding: 8px 0px;
      text-align: center;
      font-weight: bold;
      transition: 0.5s;
    }

    .conversazioni:has(#searchChats input:focus) .elencoFarmacie {
      opacity: 0;
    }

    .elencoFarmacie {
      transition: 0.5s;
      overflow-y: scroll;
      height: 82vh;
    }

    .dropdown p:hover {
      background: lightgray;
    }

    #searchChats .containerInput {
      position: relative;
    }

    .containerInput input:focus ~ span {
      opacity: 0;
    }

    .containerInput span {
      position: absolute;
      transform: translate(-50%, -50%);
      top: 50%;
      right: 0px;
      z-index: 5;
      color: #6f6f6f;
      transition: 0.5s;
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

    .chatHeader .contatto {
      order: 1;
      display: flex;
      gap: 1em;
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
      background: #0074bc;
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

    .submitContainer button {
      min-width: 40px;
      min-height: 40px;
      border: none;
      border-radius: 50%;
      background: white;
      font-size: 20px;
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
      color: black;
    }

    * {
      font-family: inherit;
    }

    .material-icons {
      font-family: "Material Icons";
      font-weight: normal;
      font-style: normal;
      font-size: 24px;
      line-height: 1;
      letter-spacing: normal;
      text-transform: none;
      display: inline-block;
      white-space: nowrap;
      word-wrap: normal;
      direction: ltr;
      -webkit-font-smoothing: antialiased;
      cursor: pointer;
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

    ::-webkit-scrollbar-track {
      /* background-color: red; */
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

  render() {
    //aggiungo il main e lo metto in absolute per non andare in display flex che avevo messo per il login
    return html`
      <main>
        <header></header>

        <section>
          <div class="conversazioni">
            <div id="searchChats">
              <div class="containerInput">
                <input type="text" placeholder="cerca farmacie" />
                <span class="material-icons"> search </span>

                <div class="dropdown">
                  <p>farmacia1</p>
                  <p>farmacia2</p>
                  <p>farmacia3</p>
                </div>
              </div>
            </div>

            <div class="elencoFarmacie">
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

              <div>
                <div class="avatar"></div>
                <p class="name">farmacia3</p>
              </div>

              <div>
                <div class="avatar"></div>
                <p class="name">farmacia3</p>
              </div>

              <div>
                <div class="avatar"></div>
                <p class="name">farmacia3</p>
              </div>

              <div>
                <div class="avatar"></div>
                <p class="name">farmacia3</p>
              </div>

              <div>
                <div class="avatar"></div>
                <p class="name">farmacia3</p>
              </div>

              <div>
                <div class="avatar"></div>
                <p class="name">farmacia3</p>
              </div>

              <div>
                <div class="avatar"></div>
                <p class="name">farmacia3</p>
              </div>

              <div>
                <div class="avatar"></div>
                <p class="name">farmacia3</p>
              </div>

              <div>
                <div class="avatar"></div>
                <p class="name">farmacia3</p>
              </div>

              <div>
                <div class="avatar"></div>
                <p class="name">farmacia3</p>
              </div>

              <div>
                <div class="avatar"></div>
                <p class="name">farmacia3</p>
              </div>

              <div>
                <div class="avatar"></div>
                <p class="name">farmacia3</p>
              </div>

              <div>
                <div class="avatar"></div>
                <p class="name">farmacia3</p>
              </div>
            </div>
          </div>

          <div class="chat">
            <div class="chatHeader">
              <div class="settings">
                <span class="material-icons" id="settingsIcon">settings</span>
              </div>

              <div class="contatto">
                <h2>ChatBox ${this.login.username}</h2>
              </div>
            </div>

            <ul class="messageBox">
              ${this.messages.map((item, _) => html` <li>${item}</li> `)}
            </ul>

            <div id="inputControls">
              <input
                type="text"
                placeholder="Scrivi un messaggio..."
                @input=${this.onMessageInput}
                @keydown=${this.checkEnter}
                .value=${this.message}
              />
              <div class="submitContainer">
                <button @click=${this.sendMessage}>
                  <span class="material-icons">send</span>
                </button>
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

  checkEnter(event) {
    if (event.key == "Enter") this.sendMessage();
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
