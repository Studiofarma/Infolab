import { LitElement, html, css } from "lit";
import { ref, createRef } from "lit/directives/ref.js";

import { IconNames } from "../../../enums/icon-names";

import "../../../components/avatar";
import "../../../components/button-text";
import "../../../components/icon";
export class profileSettings extends LitElement {
  static properties = {
    username: { type: String },
    isEditing: { type: Boolean },
  };

  constructor() {
    super();
    this.isEditing = false;
    this.inputFileRef = createRef();
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

    label {
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

    input[disabled] {
      background-color: #f1f1f1aa;
    }

    .inputContainer input[disabled] ~ span {
      position: absolute;
      transform: translateY(-50%);
      top: 50%;
      right: 5px;
      transition: 0.5s;
      color: #206cf7;
      cursor: pointer;
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

  render() {
    return html`
      <header>
        <h2>Personalizzazione profilo</h2>
      </header>

      <section>
        <div class="avatarContainer">
          <il-avatar id="0" name=${this.username} sizeClass="large"></il-avatar>
          <button
            @click=${() => {
              this.inputFileRef.value.click();
            }}
          >
            <il-icon name=${IconNames.update}></il-icon>
            carica un'immagine
          </button>
          <input
            type="file"
            accept="image/png, image/jpeg"
            ${ref(this.inputFileRef)}
          />
        </div>

        <div class="fieldset">
          <label for="username">Nome Utente:</label>

          <div class="inputContainer">
            <input
              type="text"
              id="username"
              value=${this.username}
              ?disabled=${!this.isEditing}
            />

            <span>
              <il-icon name=${IconNames.pencil}></il-icon>
            </span>
          </div>
        </div>
      </section>

      <footer>
        <il-button-text text="Annulla" color="#dc2042"></il-button-text>
        <il-button-text text="Conferma"></il-button-text>
      </footer>
    `;
  }
}

customElements.define("il-profile-settings", profileSettings);
