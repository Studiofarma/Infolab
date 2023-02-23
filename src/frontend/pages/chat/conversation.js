import { LitElement, html, css } from "lit";

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

    div:hover {
      background-color: #00234f;
    }
  `;

  render() {
    return html`
      <div>
        <p class="name">${this.name}</p>
      </div>
    `;
  }

  willUpdate(changedProperties) {
    if (changedProperties.has("nameStr")) this.name = this.nameStr;
  }
}

customElements.define("il-conversation", Conversation);
