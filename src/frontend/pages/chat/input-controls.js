import { LitElement, html, css } from "lit";

import "../../components/button-icon";

export class InputControls extends LitElement {
  static styles = css`
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
      border: none;
      outline: none;
    }

    #inputControls > * {
      flex-shrink: 1;
    }

    #inputControls #submitContainer {
      flex-basis: 10%;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    #submitContainer il-button-icon {
      width: 40px;
      height: 40px;
      margin-top: 0px;
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
  `;

  render() {
    return html`
      <div id="inputControls">
        <input
          type="text"
          placeholder="Scrivi un messaggio..."
          @input=${this.onMessageInput}
          @keydown=${this.checkEnterKey}
          .value=${this.message}
        />
        <div id="submitContainer">
          <il-button-icon
            @click=${this.sendMessage}
            content="send"
          ></il-button-icon>
        </div>
      </div>
    `;
  }

  onMessageInput(e) {
    const inputEl = e.target;
    this.message = inputEl.value;
  }

  checkEnterKey(event) {
    if (event.key === "Enter") this.sendMessage();
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

customElements.define("il-input-controls", InputControls);
