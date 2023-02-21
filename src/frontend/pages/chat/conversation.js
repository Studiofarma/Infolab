import { LitElement, html, css } from "lit";

import "../../components/button-icon";

class Conversation extends LitElement {
  static properties = {
    name: "",
    nameStr: { type: String, attribute: "name" },
  };

  static styles = css`
    div {
      min-height: 60px;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 12px;
      cursor: pointer;
      transition: 0.5s;
    }

    il-button-icon {
      margin-left: auto;
      opacity: 0;
      transition: 0.5s;
    }

    div:hover {
      background-color: #00234f;
    }

    div:hover il-button-icon {
      opacity: 1;
    }
  `;

  render() {
    return html`
      <div>
        <il-avatar></il-avatar>
        <p class="name">${this.name}</p>
        <il-button-icon
          content="delete"
          @click=${() => this.deleteConversation(this.name)}
        ></il-button-icon>
      </div>
    `;
  }

  deleteConversation(name) {
    this.dispatchEvent(
      new CustomEvent("deleting-conversation", {
        detail: {
          name: name,
        },
      })
    );
  }

  willUpdate(changedProperties) {
    if (changedProperties.has("nameStr")) this.name = this.nameStr;
  }
}

customElements.define("il-conversation", Conversation);
