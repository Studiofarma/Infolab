import { LitElement, html, css } from "lit";

import { IconNames } from "../enums/icon-names";

import { ElementMixin } from "../models/element-mixin";

import "./button-icon";

export class AccordionCheckBox extends ElementMixin(LitElement) {
  static properties = {
    IsSelectionListOpened: { type: Boolean },
  };

  constructor() {
    super();
    this.IsSelectionListOpened = false;
  }

  render() {
    return html`
      <div class="container">
        <div class="current" @click=${this.toggleIsSelectionListOpened}>
          <slot name="current"></slot>

          <il-button-icon
            content=${this.IsSelectionListOpened
              ? IconNames.menuUp
              : IconNames.menuDown}
          ></il-button-icon>
        </div>

        <slot
          name="selection-list"
          class=${this.IsSelectionListOpened ? "open" : ""}
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

customElements.define("il-accordion-checkbox", AccordionCheckBox);
