import { html, css } from "lit";

import { ThemeColorService } from "../services/theme-color-service";

import { IconNames } from "../enums/icon-names";
import { ThemeCSSVariables } from "../enums/theme-css-variables";

import { BaseComponent } from "./base-component";

import "./button-icon";

export class ComboBox extends BaseComponent {
  static properties = {
    IsSelectionListOpened: { type: Boolean },
    placeholder: { type: String },
  };

  constructor() {
    super();
    this.IsSelectionListOpened = false;
  }

  static styles = css`
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      ${ThemeColorService.getThemeVariables()};
    }

    .container {
      position: relative;
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .current {
      position: relative;
      width: 100%;
      padding: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border: 2px solid ${ThemeCSSVariables.inputBorder};
      border-radius: 10px;
      cursor: pointer;
      transition: 0.5s;
    }

    .placeholder {
      position: absolute;
      top: 0px;
      left: 10px;
      transform: translateY(-50%);
      font-size: small;
      padding: 0px 5px;
      color: ${ThemeCSSVariables.inputBorder};
      background: ${ThemeCSSVariables.dialogBg};
    }

    .current.focused {
      border: 2px solid ${ThemeCSSVariables.inputFocusedBorder};
    }

    .current.focused .placeholder {
      color: ${ThemeCSSVariables.inputFocusedBorder};
    }

    slot[name="selection-list"] {
      width: 100%;
      display: flex;
      flex-direction: column;
      border-radius: 5px;
    }

    slot[hidden] {
      display: none;
    }
  `;

  render() {
    return html`
      <div class="container">
        <div
          class=${"current " + (this.IsSelectionListOpened ? "focused" : "")}
          @click=${this.toggleIsSelectionListOpened}
        >
          <p class="placeholder">${this.placeholder}</p>

          <slot name="current"></slot>

          <il-button-icon
            content=${this.IsSelectionListOpened
              ? IconNames.menuUp
              : IconNames.menuDown}
          ></il-button-icon>
        </div>

        <slot
          name="selection-list"
          ?hidden=${!this.IsSelectionListOpened}
          @click=${this.dispatchSelectionEvent}
        ></slot>
      </div>
    `;
  }

  // Getters & Setters

  setIsSelectionListOpened(value) {
    this.IsSelectionListOpened = value;
  }

  // --------------------------------

  toggleIsSelectionListOpened() {
    this.IsSelectionListOpened = !this.IsSelectionListOpened;
  }

  dispatchSelectionEvent(event) {
    this.dispatchEvent(
      new CustomEvent("selected-item", {
        detail: {
          target: event.target,
        },
      })
    );
  }
}

customElements.define("il-combo-box", ComboBox);
