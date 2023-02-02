import { LitElement, html, css } from "lit";

export class ButtonIcon extends LitElement {
  static get properties() {
    return {
      content: "",
    };
  }

  static styles = css`
    :host {
      display: inline;
      align-items: center;
    }
    #button {
      height: 100%;
      width: 100%;
      justify-content: center;
      align-items: center;
      font-family: "Material Icons";
      font-weight: normal;
      font-style: normal;
      font-size: 24px;
      line-height: 1;
      letter-spacing: normal;
      text-transform: none;
      display: flex;
      white-space: nowrap;
      word-wrap: normal;
      direction: ltr;
      -webkit-font-smoothing: antialiased;
      cursor: pointer;
      user-select: none;
      min-height:30px;
      min-width:30px;
    }

    #button:hover{
      background-color:rgba(0,0,0,0.12);
      border-radius:50%;
    }

  `;

  constructor() {
    super();
    this.content = "";
  }

  render() {
    return html` <div id="button">${this.content}</div> `;
    
  }
}

customElements.define("il-button-icon", ButtonIcon);
