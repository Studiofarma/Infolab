import { LitElement, html, css } from "lit";

import Immagine from '../assets/images/immagine.jpeg'

export class Avatar extends LitElement {

    static properties = {
        //...
    }

    constructor() {
        super()
        //...
    }

    static styles = css`
    .avatar {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: hidden;
    }

    .avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
    }
    `

    
    render() {
        return html`
            <div class="avatar">
                <img src=${Immagine} />
            </div>
        `
    }

}

customElements.define('il-avatar', Avatar)