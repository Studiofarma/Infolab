import { LitElement, css, html } from "lit";

export class EmptyMessages extends LitElement {
  static styles = css`
    div {
      width: 100%;
      height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
    h1 {
      color: darkgray;
    }

    h2 {
      color: lightgray;
    }
  `;

  render() {
    return html`
      <div>
        <h1>Nuova conversazione selezionata</h1>
        <h2>Per iniziare invia un messaggio</h2>
      </div>
    `;
  }
}

customElements.define("il-empty-messages", EmptyMessages);