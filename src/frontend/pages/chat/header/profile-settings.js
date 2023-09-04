import { html, css } from "lit";
import { ref, createRef } from "lit/directives/ref.js";

import { UsersService } from "../../../services/users-service";
import { ThemeColorService } from "../../../services/theme-color-service";

import { IconNames } from "../../../enums/icon-names";
import { ThemeCSSVariables } from "../../../enums/theme-css-variables";

import "../../../components/avatar";
import "../../../components/button-text";
import "../../../components/button-icon";
import "../../../components/snackbar";
import "../../../components/input-with-icon";
import "./theme-switcher";

import { BaseComponent } from "../../../components/base-component";
import { UserProfileService } from "../../../services/user-profile-service";

const maxLength = 30;

export class profileSettings extends BaseComponent {
  static properties = {
    isFocused: { type: Boolean },
    imagePath: { type: String },
    currentUserDescription: { type: String },
    currentAvatarURL: { type: String },
    userDescription: { type: String },
    user: { type: Object },
  };

  constructor() {
    super();
    this.temp = "";
    this.imagePath = "";
    this.isFocused = false;
    this.userDescriptionInputRef = createRef();
    this.inputFileRef = createRef();
    this.snackbarRef = createRef();
    this.avatarRef = createRef();
    this.themeSwitcherRef = createRef();
  }

  static styles = css`
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      ${ThemeColorService.getThemeVariables()};
      color: ${ThemeCSSVariables.text};
    }

    main {
      position: relative;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      gap: 1em;
    }

    header h2 {
      text-align: center;
      color: ${ThemeCSSVariables.text};
    }

    section {
      overflow-y: auto;
      flex-grow: 1;
      padding: 0px 4px 60px 4px;
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
      border-radius: 8px;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 5px 0px;
      gap: 10px;
      cursor: pointer;
      background: ${ThemeCSSVariables.buttonBg};
      color: ${ThemeCSSVariables.actionText};
    }

    input[type="file"] {
      display: none;
    }

    .fieldset {
      max-width: 100%;
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin: 15px 0px;
      overflow-x: hidden;
    }

    .fieldset p {
      display: block;
      font-size: 15px;
      color: ${ThemeCSSVariables.text};
    }

    .fieldset > * {
      width: 100%;
    }

    footer {
      width: 100%;
      padding: 10px 0px;
      background: ${ThemeCSSVariables.dialogBg};
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 1000;
      position: absolute;
      bottom: 0px;
      left: 0px;
    }

    ::-webkit-scrollbar {
      width: 4px;
      margin-left: 10px;
    }

    ::-webkit-scrollbar-track {
      background-color: none;
    }

    ::-webkit-scrollbar-thumb {
      border-radius: 10px;
      background-color: ${ThemeCSSVariables.scrollbar};
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener("keydown", async (event) => {
      if (event.key === "Escape") this.restoreDefault();
      if (event.key === "Enter") await this.confirmChanges();
    });
  }

  render() {
    return html`
      <main>
        <header>
          <h2>Personalizzazione profilo</h2>
        </header>

        <div class="avatarContainer">
          <il-avatar
            .user=${this.user}
            sizeClass="large"
            name=${this.userDescription}
            .avatarLink=${this.imagePath}
            ?isDefaultAvatar=${this.imagePath === ""}
            .hasStatus=${false}
          ></il-avatar>
          <!-- <button
            @click=${() => {
            this.inputFileRef.value.click();
          }}
          >
            <il-button-icon
              @click=${() => this.userDescriptionInputRef.value.focus()}
              content=${IconNames.update}
            ></il-button-icon>
            Carica immagine
          </button> -->
          <!-- <input
            type="file"
            @change=${this.onFileUpload}
            accept="image/png, image/jpeg"
            ${ref(this.inputFileRef)}
          /> -->
        </div>

        <section>
          <div class="fieldset">
            <p>Nome Utente:</p>

            <il-input-with-icon
              ${ref(this.userDescriptionInputRef)}
              .iconName=${IconNames.pencil}
              @input=${this.setUserDescription}
              @il:icon-clicked=${this.focusAndSelectInput}
              placeholder="Inserisci un nome utente"
              value=${this.userDescription}
            ></il-input-with-icon>
          </div>

          <div class="fieldset">
            <p>Preferenze:</p>
            <il-theme-switcher
              ${ref(this.themeSwitcherRef)}
            ></il-theme-switcher>
          </div>
        </section>

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
      </main>

      <il-snackbar ${ref(this.snackbarRef)}></il-snackbar>
    `;
  }

  onFileUpload() {
    let file = this.inputFileRef.value?.files[0];
    this.imagePath = URL.createObjectURL(file);
    this.requestUpdate();
  }

  focusAndSelectInput() {
    this.userDescriptionInputRef.value.focusInput();
    this.userDescriptionInputRef.value.selectInput();
  }

  focus() {
    this.isFocused = true;
  }

  updated(c) {
    if (c.has("isFocused") && this.isFocused) this.focusAndSelectInput();
  }

  setUserDescription(event) {
    if (event.target.value.length > maxLength) {
      this.snackbarRef.value.openSnackbar(
        `NON E' POSSIBILE SUPERARE I ${maxLength} CARATTERI`,
        "error",
        5000
      );

      this.userDescriptionInputRef.value.value = event.target.value.slice(
        0,
        -1
      );
      return;
    }

    this.userDescription = event.target.value;
  }

  restoreDefault() {
    // restoring profile
    this.userDescription = this.currentUserDescription;
    this.userDescriptionInputRef.value?.setInputValue(
      this.currentUserDescription
    );

    this.imagePath = this.currentAvatarURL;
    // this.inputFileRef.value.value = this.currentAvatarURL; // REMOVED TEMPORARILY WITH THE IMAGE INPUT

    // restoring theme
    const restoredTheme = this.themeSwitcherRef.value?.getInitialTheme();

    ThemeColorService.setCurrentThemeName(restoredTheme);

    this.themeSwitcherRef.value?.setTheme(restoredTheme);

    document.dispatchEvent(ThemeColorService.changeThemeEvent);

    this.themeSwitcherRef.value?.setIsThemesSelectionOpened(false);

    this.closeMenu();
  }

  async confirmChanges() {
    if (this.userDescription.trim() === "") {
      this.snackbarRef.value.openSnackbar(
        "INSERIRE UN NOME UTENTE NON VUOTO",
        "error",
        5000
      );

      return;
    }

    if (this.userDescription !== this.currentUserDescription) {
      await UserProfileService.setUserDescription(this.userDescription);
      this.dispatchEvent(
        new CustomEvent("il:new-description-set", {
          detail: {
            newDescription: this.userDescription,
          },
        })
      );
    }

    if (this.imagePath !== this.currentAvatarURL) {
      this.dispatchEvent(new CustomEvent("il:new-avatar-set"));
      UsersService.setUserAvatar(this.imagePath);
    }

    // confirming theme
    this.themeSwitcherRef.value?.setIsThemesSelectionOpened(false);
    this.themeSwitcherRef.value?.setInitialTheme(
      ThemeColorService.getCurrentThemeName()
    );

    this.closeMenu();
  }

  closeMenu() {
    this.dispatchEvent(new CustomEvent("il:menu-closed"));
  }
}

customElements.define("il-profile-settings", profileSettings);
