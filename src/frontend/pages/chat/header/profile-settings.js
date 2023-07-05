import { LitElement, html, css } from "lit";

import "../../../components/avatar";
import "../../../components/button-text";
import { ButtonText } from "./../../../components/button-text";
export class profileSettings extends LitElement {
  static styles = css`
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    header h2 {
      padding-left: 2em;
    }

    section {
      display: flex;
      gap: 30px;
      padding: 2em;
    }

    il-avatar {
      align-self: center;
    }

    il-avatar::part(avatar-default) {
      width: 200px;
      height: 200px;
      font-size: 70px;
      color: white;
    }

    .fieldset {
      flex-grow: 1;
    }

    label {
      display: block;
      font-size: 20px;
      margin-bottom: 15px;
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

    footer il-button-text[text="Annulla"]::part(button) {
      background-color: #dc2042;
    }
  `;

  render() {
    return html`
      <header>
        <h2>Personalizzazione profilo</h2>
      </header>

      <section>
        <il-avatar id="0" name="prova"></il-avatar>

        <div class="fieldset">
          <label for="username">Nome Utente:</label>
          <input type="text" id="username" />
        </div>
      </section>

      <footer>
        <il-button-text text="Annulla"></il-button-text>
        <il-button-text text="Conferma"></il-button-text>
      </footer>
    `;
  }
}

customElements.define("il-profile-settings", profileSettings);
