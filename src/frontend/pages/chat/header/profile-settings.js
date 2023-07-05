import { LitElement, html, css } from "lit";

export class profileSettings extends LitElement {
  static styles = css``;

  render() {
    return html` <h2 id="titolo">Personalizzazione profilo</h2>`;
  }
}

customElements.define("il-profile-settings", profileSettings);
