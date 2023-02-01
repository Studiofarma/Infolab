
import { LitElement, html } from "lit";
export class buttons_icons extends LitElement {
  static get properties() {
    return {
      content: "",
    };
  }
  constructor(){
    super();
    this.content="";
  }
  static styles = css`


    #button {
      font-family: "Material Icons";
      width: 100%;
      color: rgba(10, 10, 128, 0.829);
      width: auto;
      height: auto;
      font-weight: normal;
      font-style: normal;
      font-size: 24px;
      line-height: 1;
      letter-spacing: normal;
      text-transform: none;
      white-space: nowrap;
      word-wrap: normal;
      direction: ltr;
      -webkit-font-smoothing: antialiased;
      cursor: pointer;
      user-select: none;
    }
  `;

  render() {
    return html` 
      <span id="button"><p>${this.content}</p></span> 
      `;
  }
}

customElements.define('il-button-icon', buttons_icons);
