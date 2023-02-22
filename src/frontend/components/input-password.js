import { LitElement, html, css } from "lit";

import "../components/button-icon";

export class InputPassword extends LitElement {
  static properties = {
    pswVisibility: false,
    emptyPasswordField: false,
    accessErrorMessage: false,
    password: "",
  };

  constructor() {
    super();
    this.pswVisibility = false;
    this.emptyPasswordField = false;
    this.accessErrorMessage = "";
    this.password = "password1";
  }
  static styles = css`
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    input[type="text"],
    input[type="password"] {
      position: relative;
      width: 100%;
      height: 40px;
      padding: 5px 10px;
      border: none;
      outline: none;
      font-size: 15pt;
      transition: 0.5s;
      margin-top: 10px;
      border-radius: 10px;
      box-shadow: 0 0 10px #333333;
    }
    .text-container {
      position: relative;
    }
    .text-container il-button-icon {
      position: absolute;
      transform: translateY(50%);
      bottom: 20px;
      right: 10px;
      z-index: 2;
      color: rgba(10, 10, 128, 0.829);
      opacity: 0;
      transition: 0.5s;
    }
    .text-container:hover il-button-icon {
      opacity: 1;
      visibility: visible;
      cursor: pointer;
    }
    label[id$="Error"] {
      display: block;
      color: darkred;
      padding-top: 5px;
      font-size: 10pt;
    }

    input,
    button {
      font-family: inherit;
    }
    .text-container::before {
      content: "";
      position: absolute;
      top: 5px;
      left: -2.5px;
      border-radius: 10px;
      width: calc(100% + 6px);
      height: 100%;
      background: #c1002e;
      z-index: -1;
      transition: 0.5s;
      scale: 0;
    }
    .text-container:has(input.error)::before {
      scale: 1;
    }
    .text-container::after {
      content: "!";
      position: absolute;
      transform: translateY(50%);
      bottom: 20px;
      right: 10px;
      z-index: 2;
      width: 20px;
      height: 20px;
      padding: 5px;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      color: white;
      background: #c1002e;
      transition: 0.5s;
      transition-delay: 0.5s;
      opacity: 0;
    }
    .text-container:has(input.error)::after {
      opacity: 1;
    }
    .text-container:hover::after {
      display: none;
    }
  `;

  render() {
    return html`
      <div>
        <label>
          Password
          <div class="text-container">
            <input
              class=${this.emptyPasswordField ? "error" : ""}
              id="password"
              type=${this.pswVisibility ? "text" : "password"}
              @input=${this.onPasswordInput}
              @keydown=${this.checkEnterKey}
              .value=${this.password}
              placeholder="Inserisci la password"
            />
            <il-button-icon
              @click=${this.setVisibility}
              content="${!this.pswVisibility ? "visibility" : "visibility_off"}"
            ></il-button-icon>
          </div>
        </label>
      </div>
    `;
  }

  setVisibility() {
    this.pswVisibility = !this.pswVisibility;
  }
  onPasswordInput(e) {
    const inputEl = e.target;
    this.password = inputEl.value;
  }
  getPassword() {
    return this.password;
  }
}

customElements.define("il-password", InputPassword);
