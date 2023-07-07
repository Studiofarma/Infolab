import { LitElement, html, css } from "lit";
import { ref, createRef } from "lit/directives/ref.js";

import { IconNames } from "../../../enums/icon-names";

import "../../../components/avatar";
import "../../../components/button-text";
import "../../../components/icon";
import "../../../components/snackbar";
import "../../../components/input-with-icon";

const maxLength = 30;
export class profileSettings extends LitElement {
  static properties = {
    isFocus: { type: Boolean },
    currentUsername: { type: String },
    username: { type: String },
  };

  constructor() {
    super();
    this.temp = "";
    this.isFocus = false;
    this.usernameInputRef = createRef();
    this.inputFileRef = createRef();
    this.snackbarRef = createRef();
  }

  static styles = css`
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    header h2 {
      text-align: center;
    }

    section {
      display: flex;
      align-items: center;
      gap: 30px;
      padding: 2em;
      margin-bottom: 50px;
    }

    .avatarContainer {
      display: flex;
      flex-direction: column;
      gap: 20px;
      justify-content: center;
      align-items: center;
    }

    .avatarContainer button {
      width: 100%;
      border: none;
      outline: none;
      padding: 5px 10px;
      border-radius: 8px;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      color: #206cf7;
    }

    input[type="file"] {
      display: none;
    }

    .fieldset {
      flex-grow: 1;
    }

    p {
      display: block;
      font-size: 20px;
      margin-bottom: 15px;
    }

    .inputContainer {
      position: relative;
    }

    input[type="text"] {
      display: block;
      width: 100%;
      height: 40px;
      padding: 0 10px;
      border: 1px solid gray;
      border-radius: 5px;
      outline: none;
    }

    .inputContainer il-icon {
      position: absolute;
      color: #206cf7;
      transform: translateY(-50%);
      top: 50%;
      right: 5px;
      transition: 0.5s;
      cursor: pointer;
    }

    .inputContainer input:focus ~ il-icon {
      display: none;
    }

    input[type="text"]:focus {
      border: 2px solid #206cf7;
    }

    footer {
      position: absolute;
      bottom: 0px;
      left: 0px;
      width: 100%;
      display: flex;
      justify-content: end;
      align-items: center;
      gap: 10px;
      padding: 1em 2em;
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener("keydown", (event) => {
      if (event.key === "Escape") this.restoreDefault();
      if (event.key === "Enter") this.confirmEdit();
    });
  }

  render() {
    return html`
      <header>
        <h2>Personalizzazione profilo</h2>
      </header>

      <section>
        <div class="avatarContainer">
          <il-avatar
            id="0"
            name=${this.username ?? ""}
            sizeClass="large"
          ></il-avatar>
          <button
            @click=${() => {
              this.inputFileRef.value.click();
            }}
          >
            <il-icon
              @click=${() => this.usernameInputRef.value.focus()}
              name=${IconNames.update}
            ></il-icon>
            Carica immagine
          </button>
          <input
            type="file"
            accept="image/png, image/jpeg"
            ${ref(this.inputFileRef)}
          />
        </div>

        <div class="fieldset">
          <p>Nome Utente:</p>

          <il-input-with-icon
            ${ref(this.usernameInputRef)}
            .iconName=${IconNames.pencil}
            @input=${this.setUsername}
            @icon-click=${this.onIconClick}
            placeholder="Inserisci un nome utente"
            value=${this.username}
          ></il-input-with-icon>
        </div>
      </section>

      <footer>
        <il-button-text
          text="Annulla"
          color="#dc2042"
          @click=${this.restoreDefault}
        ></il-button-text>
        <il-button-text
          text="Conferma"
          @click=${this.confirmEdit}
        ></il-button-text>
      </footer>

      <il-snackbar ${ref(this.snackbarRef)}></il-snackbar>
    `;
  }

  onIconClick() {
    this.focusAndSelectInput();
  }

  focusAndSelectInput() {
    this.usernameInputRef.value.focusInput();
    this.usernameInputRef.value.selectInput();
  }

  setIsFocus() {
    this.isFocus = true;
  }

  updated(c) {
    if (c.has("isFocus") && this.isFocus) this.focusAndSelectInput();
  }

  setUsername(event) {
    if (event.target.value.length > maxLength) {
      this.snackbarRef.value.openSnackbar(
        `NON E' POSSIBILE SUPERARE I ${maxLength} CARATTERI`,
        "error",
        5000
      );

      this.usernameInputRef.value.value = event.target.value.slice(0, -1);
      return;
    }

    this.username = event.target.value;
  }

  restoreDefault() {
    this.username = this.currentUsername;
    this.usernameInputRef.value?.setInputValue(this.currentUsername);
    this.closeMenu();
  }

  confirmEdit() {
    if (this.username.trim() === "") {
      this.snackbarRef.value.openSnackbar(
        "INSERIRE UN NOME UTENTE NON VUOTO",
        "error",
        5000
      );

      return;
    }

    this.dispatchEvent(
      new CustomEvent("set-new-description", {
        detail: {
          newDescription: this.username,
        },
      })
    );

    this.closeMenu();
  }

  closeMenu() {
    this.dispatchEvent(new CustomEvent("close-menu"));
  }
}

customElements.define("il-profile-settings", profileSettings);
