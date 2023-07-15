import { LitElement, html, css } from "lit";
import { ref, createRef } from "lit/directives/ref.js";

import { UsersService } from "../../../services/users-service";
import { ThemeColorService } from "../../../services/theme-color-service";

import { IconNames } from "../../../enums/icon-names";
import { ThemeCSSVariables } from "../../../enums/theme-css-variables";

import "../../../components/avatar";
import "../../../components/button-text";
import "../../../components/icon";
import "../../../components/snackbar";
import "../../../components/input-with-icon";
import "./theme-switcher";

const maxLength = 30;

export class profileSettings extends LitElement {
  static properties = {
    isFocused: { type: Boolean },
    imagePath: { type: String },
    currentUsername: { type: String },
    currentAvatarURL: { type: String },
    username: { type: String },
    user: { type: Object },
  };

  constructor() {
    super();
    this.temp = "";
    this.imagePath = "";
    this.isFocused = false;
    this.usernameInputRef = createRef();
    this.inputFileRef = createRef();
    this.snackbarRef = createRef();
    this.avatarRef = createRef();
  }

  static styles = css`
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      ${ThemeColorService.getThemeVariables()};
      color: ${ThemeCSSVariables.text};
    }

    header h2 {
      text-align: center;
    }

    section {
      display: flex;
      align-items: center;
      gap: 30px;
      padding: 2em;
    }

    .avatarContainer {
      display: flex;
      flex-direction: column;
      gap: 20px;
      justify-content: center;
      align-items: center;
      margin-top: auto;
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
      background: ${ThemeCSSVariables.buttonBg};
      color: ${ThemeCSSVariables.actionText};
    }

    input[type="file"] {
      display: none;
    }

    .fieldset {
      flex-grow: 1;
    }

    .fieldset p {
      display: block;
      font-size: 20px;
      margin: 15px 0px;
    }

    .inputContainer {
      position: relative;
    }

    .inputContainer il-icon {
      position: absolute;
      transform: translateY(-50%);
      top: 50%;
      right: 5px;
      transition: 0.5s;
      cursor: pointer;
    }

    .inputContainer input:focus ~ il-icon {
      display: none;
    }

    footer {
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
      if (event.key === "Enter") this.confirmChanges();
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
            .user=${this.user}
            sizeClass="large"
            name=${this.username}
            .avatarLink=${this.imagePath}
            ?isDefaultAvatar=${this.imagePath === ""}
            .hasStatus=${false}
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
            @change=${this.onFileUpload}
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
            @il:icon-clicked=${this.focusAndSelectInput}
            placeholder="Inserisci un nome utente"
            value=${this.username}
          ></il-input-with-icon>
        </div>
      </section>

      <div>
        <p>Tema:</p>

        <il-theme-switcher></il-theme-switcher>
      </div>

      <footer>
        <il-button-text
          text="Annulla"
          color=${`${ThemeCSSVariables.buttonUndoBg}`}
          @click=${this.restoreDefault}
        ></il-button-text>
        <il-button-text
          text="Conferma"
          @click=${this.confirmChanges}
        ></il-button-text>
      </footer>

      <il-snackbar ${ref(this.snackbarRef)}></il-snackbar>
    `;
  }

  onFileUpload() {
    let file = this.inputFileRef.value?.files[0];
    this.imagePath = URL.createObjectURL(file);
    this.requestUpdate();
  }

  focusAndSelectInput() {
    this.usernameInputRef.value.focusInput();
    this.usernameInputRef.value.selectInput();
  }

  focus() {
    this.isFocused = true;
  }

  updated(c) {
    if (c.has("isFocused") && this.isFocused) this.focusAndSelectInput();
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

    this.imagePath = this.currentAvatarURL;
    this.inputFileRef.value.value = this.currentAvatarURL;

    this.closeMenu();
  }

  confirmChanges() {
    if (this.username.trim() === "") {
      this.snackbarRef.value.openSnackbar(
        "INSERIRE UN NOME UTENTE NON VUOTO",
        "error",
        5000
      );

      return;
    }

    if (this.username !== this.currentUsername) {
      this.dispatchEvent(new CustomEvent("il:new-description-set"));
      UsersService.setUserDescription(this.username);
    }

    if (this.imagePath !== this.currentAvatarURL) {
      this.dispatchEvent(new CustomEvent("il:new-avatar-set"));
      UsersService.setUserAvatar(this.imagePath);
    }

    this.closeMenu();
  }

  closeMenu() {
    this.dispatchEvent(new CustomEvent("il:menu-closed"));
  }
}

customElements.define("il-profile-settings", profileSettings);
