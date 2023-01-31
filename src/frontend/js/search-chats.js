import { LitElement, html, css } from "lit";

export class SearchChats extends LitElement {
  static properties = {
    pharmaciesList: { state: true },
    query: {},
  };

  static styles = css`
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    #searchChats {
      width: 100%;
      padding: 5px 20px;
      margin-bottom: 50px;
      column-gap: 10px;
      position: relative;
    }

    #searchChats input {
      width: 100%;
      height: 40px;
      border-radius: 10px;
      padding: 10px;
      transition: 0.5s;
      border: none;
      outline: none;
    }

    #searchChats .dropdown {
      position: absolute;
      top: 39px;
      left: 0px;
      width: 100%;
      background: white;
      z-index: 4;
      color: black;
      font-weight: 200;
      max-height: 0px;
      overflow-y: hidden;
      transition: 0.5s;
      text-align: center;
    }

    #searchChats input:focus {
      border-bottom-left-radius: 0px;
      border-bottom-right-radius: 0px;
    }

    #searchChats input:focus ~ .dropdown {
      max-height: 325px;
      margin-top: 3px;
      border-bottom-left-radius: 10px;
      border-bottom-right-radius: 10px;
      overflow-y: auto;
    }

    .dropdown::-webkit-scrollbar {
      background: lightgray;
      border-radius: 10px;
      width: 5px;
    }

    .dropdown::-webkit-scrollbar-thumb {
      background: gray;
      width: 1px;
      height: 1px;
    }

    .dropdown > div {
      min-height: 60px;
      padding: 8px 10px;
      font-weight: bold;
      transition: 0.5s;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 1em;
    }

    .dropdown p {
      overflow-x: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      max-width: calc(100% - 80px);
    }

    .dropdown .nofound {
      color: gray;
      font-size: 10pt;
      align-self: center;
      font-weight: lighter;
    }

    .material-icons {
      font-family: "Material Icons";
      font-weight: normal;
      font-style: normal;
      font-size: 24px;
      line-height: 1;
      letter-spacing: normal;
      text-transform: none;
      display: inline-block;
      white-space: nowrap;
      word-wrap: normal;
      direction: ltr;
      -webkit-font-smoothing: antialiased;
      cursor: pointer;
    }

    .dropdown > div:hover {
      background: lightgray;
    }

    #searchChats .containerInput {
      position: relative;
    }

    .containerInput input:focus ~ span {
      opacity: 0;
      visibility: hidden;
    }

    .containerInput span {
      position: absolute;
      transform: translate(-50%, -50%);
      top: 50%;
      right: 0px;
      z-index: 5;
      color: #6f6f6f;
      transition: 0.5s;
    }

    .dropdown .avatar {
      background: gray;
    }

    .avatar {
      width: 50px;
      height: 50px;
      border-radius: 50%;
    }
  `;

  constructor() {
    super();
    this.pharmaciesList = [];
    this.query = "";
  }

  render() {
    return html`
      <div id="searchChats">
        <div class="containerInput">
          <input
            type="text"
            placeholder="cerca farmacie"
            @input=${this.setFilter}
          />
          <span class="material-icons"> search </span>

          <div class="dropdown">${this.showTips()}</div>
        </div>
      </div>
    `;
  }

  setFilter(event) {
    const text = event.target.value;
    this.query = text.toLowerCase();

    const farmacie = this.myfetch();
    let tmp = [];

    farmacie.forEach((pharmacy) => {
      if (pharmacy.name.toLowerCase().indexOf(this.query) > -1)
        tmp.push(pharmacy);
    });

    this.pharmaciesList = tmp;
  }

  myfetch() {
    // ho provato con require e riesce a prendermelo
    const json = require("../fakeServer/farmacie.json");

    return json;
  }

  showTips() {
    if (this.pharmaciesList.length > 0) {
      return this.pharmaciesList.map(
        (pharmacy) => html`
          <div>
            <div class="avatar">
              <img src=${this.loadAvatarImage} />
            </div>
            <p>${pharmacy.name}</p>
          </div>
        `
      );
    } else {
      return html`<div><p class="nofound">Nessun risultato trovato</p></div>`;
    }
  }

  loadAvatarImage() {
    // DA DEFINIRE
    // require("../fakeServer/immagini/avatar1.png");
    // console.log(imagePath);

    return;
  }
}
customElements.define("il-search", SearchChats);
