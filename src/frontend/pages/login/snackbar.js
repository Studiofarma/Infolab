import { LitElement, html, css } from "lit";

import "../../components/button-icon";

export class Snackbar extends LitElement {
  static properties = {
    closed: { type: Boolean, attribute: "closed" },
    content: "",
  };

  constructor() {
    super();
    this.closed = false;
    this.content = "";
  }

  static styles = css`
    * {
      box-sizing: border-box;
      padding: 0px;
      margin: 0px;
    }

    #snackbar {
      display: block;
      position: fixed;
      transform: translate(-50%, -50%);
      left: 50%;
      bottom: 10px;
      min-width: 500px;
      min-height: 40px;
      color: black;
      border-bottom: 5px solid #0052f0;
      border-radius: 10px;
      background: white;
      box-shadow: 0 0 20px black;
      display: flex;
      align-items: center;
      transition: all 0.5s;
      padding: 5px;
      opacity: 0;
      z-index: 1000;
    }

    p {
      flex-grow: 1;
      text-align: center;
    }

    il-button-icon {
      opacity: 0;
      transition: 0.5s;
    }

    #snackbar:hover il-button-icon {
      opacity: 1;
    }
  `;

  render() {
    return html`
      <div id="snackbar">
        <p>${this.content}</p>
        <il-button-icon
          content="mdiClose"
          @click=${this.closeSnackbar}
        ></il-button-icon>
      </div>
    `;
  }

  closeSnackbar() {
    this.shadowRoot.querySelector("#snackbar").style.opacity = 0.0;
    this.shadowRoot.querySelector("#snackbar").style.bottom = "10px";
  }
}
customElements.define("il-snackbar", Snackbar);
