import { LitElement, html, css } from "lit";
import { mdiEye } from '@mdi/js';

export class ButtonIcon extends LitElement {
  static get properties() {
    return {
      mdiEye,
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
      font-weight: normal;
      font-style: normal;
      font-family: "Material Icons";
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
      min-height: 35px;
      min-width: 35px;
      
    }

    

   

    #button:hover {
      background-color: rgb(0, 0, 255);
      border-radius: 50%;
    }
  `;

  constructor() {
    super();
    this.content = "";
    console.log(mdiEye);
  }

  render() {
    
    return html` <div >${mdiEye}</div> `;
  }
}

customElements.define("il-button-icon", ButtonIcon);
