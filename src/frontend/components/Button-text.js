import { LitElement,html,css } from "lit";

export class ButtonText extends LitElement{
    constructor(){
        super();
    
    }
    static styles = css`
    
    #preview_btn {
      margin-left: auto;
      padding: 7px 12px;
      border-radius:45px;
      background: white;
      min-width: 80px;
      text-align: center;
      border: none;
      outline: none;
      font-weight: bold;
      cursor: pointer;
    }

    `;

    render(){
        return html `
         <button id="preview_btn" @click=${this.togglePreviewer}>Preview</button>
        `
    }
}

customElements.define("il-button-text", ButtonText);