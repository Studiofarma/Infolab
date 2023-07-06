import { html, css } from "lit";
import { InputField } from "./input-field";

export class InputWithIcon extends InputField {
  static properties = {
    isFocus: { type: Boolean },
    iconName: { type: String },
    iconTooltipText: { type: String },
  };

  constructor() {
    super();
    this.isFocus = false;
  }

  static styles = [
    css`
      div {
        width: 100%;
        display: flex;
        color: white;
        border-radius: 10px;
        border: solid 2px;
      }

      .focused {
        border-color: #206cf7;
      }

      .blurred {
        border-color: #989a9d;
      }

      input {
        width: 100%;
        height: 40px;
        padding: 0 10px;
        border: none;
        outline: none;
        background-color: rgba(0, 0, 0, 0);
        position: relative;
        overflow: hidden;
      }

      il-button-icon {
        padding: 5px;
      }

      .visible {
        visibility: visible;
      }

      .hidden {
        visibility: hidden;
      }
    `,
  ];

  render() {
    return html`
      <div class=${this.isFocus ? "focused" : "blurred"}>
        <input
          placeholder="${this.placeholder}"
          @focus="${this.toggleFocus}"
          @blur=${this.toggleFocus}
          @input=${this.setValue}
          value=${this.value}
        />

        <il-button-icon
          .content=${this.iconName}
          .tooltipText=${this.iconTooltipText}
          @click=${this.iconClick}
        ></il-button-icon>
      </div>
    `;
  }

  toggleFocus() {
    this.isFocus = !this.isFocus;
  }

  iconClick() {
    this.dispatchEvent(new CustomEvent("icon-click"));
  }
}

customElements.define("il-input-with-icon", InputWithIcon);
