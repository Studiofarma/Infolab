import { LitElement, html, css, unsafeCSS } from "lit";

import { CookieService } from "../../../services/cookie-service";
import { UsersService } from "../../../services/users-service";

import crossImage from "../../../assets/images/input-search-delete.png";

import "../../../components/button-icon";
import { IconNames } from "../../../enums/icon-names";
import { InputRicerca } from "../../../components/input-ricerca";

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

    .search-chats {
      width: 100%;
      padding: 15px 10px 10px;
      column-gap: 10px;
      position: relative;
    }

    .container-input {
      position: relative;
      display: flex;
    }

    .search-icon {
      color: #b6b5b5;
      transition: 0.4s;
      width: 30px;
    }

    .search-icon {
      width: 30px;
      animation: showElement 0.5s forwards;
    }

    @keyframes hideElement {
      0% {
        opacity: 1;
        width: 30px;
      }

      100% {
        opacity: 0;
        width: 0;
      }
    }

    @keyframes showElement {
      0% {
        opacity: 0;
        width: 0;
      }

      100% {
        opacity: 1;
        width: 30px;
      }
    }

    .dropdown {
      display: none;
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
      font-weight: 400;
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

    .dropdown > div:hover {
      background: lightgray;
    }

    il-input-ricerca {
      width: 100%;
    }
  `;

  constructor() {
    super();
    this.pharmaciesList = [];
    this.query = "";
  }

  render() {
    return html`
      <div class="search-chats">
        <div class="container-input">
          <il-input-ricerca
            @search="${this.searchChat}"
            placeholder="Cerca o inizia una nuova conversazione"
          ></il-input-ricerca>
        </div>
      </div>
    `;
  }

  searchChat(event) {
    this.dispatchEvent(
      new CustomEvent("search-chat", {
        detail: {
          query: event.detail.query,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  loadChat(selectedChatName) {
    this.dispatchEvent(
      new CustomEvent("load-chat", {
        detail: {
          selectedChatName: selectedChatName,
        },
        bubbles: true,
        composed: true,
      })
    );
  }
}

customElements.define("il-search", SearchChats);
