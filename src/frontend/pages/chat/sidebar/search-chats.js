import { LitElement, html, css } from "lit";
import { ref, createRef } from "lit/directives/ref.js";

import "../../../components/input-search";

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

    il-input-ricerca {
      width: 100%;
    }
  `;

  constructor() {
    super();
    this.pharmaciesList = [];
    this.query = "";
    this.inputRef = createRef();
  }

  render() {
    return html`
      <div class="search-chats">
        <div class="container-input">
          <il-input-ricerca
            ${ref(this.inputRef)}
            @search="${this.searchChat}"
            @keydown=${this.keyPressed}
            placeholder="Cerca o inizia una nuova conversazione"
          ></il-input-ricerca>
        </div>
      </div>
    `;
  }

  clear() {
    this.inputRef.value?.clear();
  }

  getInputValue() {
    this.inputRef.value?.getInputValue();
  }

  searchChat(event) {
    this.dispatchEvent(
      new CustomEvent("search-chat", {
        detail: event.detail,
      })
    );
  }

  keyPressed(e) {
    this.dispatchEvent(
      new CustomEvent("keyPressed", { detail: { key: e.key } })
    );
  }
}

customElements.define("il-search", SearchChats);
