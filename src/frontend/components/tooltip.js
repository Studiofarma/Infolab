import { html, css } from "lit";
import { Directive, directive } from "lit/directive.js";
import { render } from "lit";

import { ThemeColorService } from "../services/theme-color-service";

import { ThemeCSSVariables } from "../enums/theme-css-variables";

// Positioning library
import {
  computePosition,
  autoPlacement,
  offset,
  shift,
  flip,
} from "@floating-ui/dom";

// Events to turn on/off the tooltip
const enterEvents = ["pointerenter", "focus"];
const leaveEvents = ["pointerleave", "blur", "keydown", "click"];

import { BaseComponent } from "./base-component";

export class Tooltip extends BaseComponent {
  static properties = {
    showing: { reflect: true, type: Boolean },
    offset: { type: Number },
  };

  // Lazy creation
  static lazy(target, callback) {
    const createTooltip = () => {
      const tooltip = document.createElement("il-tooltip");
      callback(tooltip);
      target.parentNode.insertBefore(tooltip, target.nextSibling);
      tooltip.show();
      // We only need to create the tooltip once, so ignore all future events.
      enterEvents.forEach((eventName) =>
        target.removeEventListener(eventName, createTooltip)
      );
    };
    enterEvents.forEach((eventName) =>
      target.addEventListener(eventName, createTooltip)
    );
  }

  static styles = css`
    * {
      ${ThemeColorService.getThemeVariables()};
    }

    :host {
      /* Position fixed to help ensure the tooltip is "on top" */
      z-index: 1100;
      position: fixed;
      border: none;
      background: ${ThemeCSSVariables.tooltipBg};
      padding: 4px;
      border-radius: 4px;
      display: inline-block;
      pointer-events: none;
      color: ${ThemeCSSVariables.tooltipText};

      /* Animate in */
      opacity: 0;
      transform: scale(0.75);
      transition: opacity, transform;
      transition-duration: 0.33s;
    }

    :host([showing]) {
      animation: animate 0.33s forwards;
      animation-delay: 0.75s;
    }

    @keyframes animate {
      from {
        opacity: 0;
        transform: scale(0.75);
      }

      to {
        opacity: 1;
        transform: scale(1);
      }
    }
  `;

  constructor() {
    super();
    // Finish hiding at end of animation
    this.addEventListener("transitionend", this.finishHide);
    // Attribute for styling "showing"
    this.showing = false;
    // Position offset
    this.offset = 4;
  }

  // Target for which to show tooltip
  _target = null;
  get target() {
    return this._target;
  }
  set target(target) {
    // Remove events from existing target
    if (this.target) {
      enterEvents.forEach((name) =>
        this.target.removeEventListener(name, this.show)
      );
      leaveEvents.forEach((name) =>
        this.target.removeEventListener(name, this.hide)
      );
    }
    if (target) {
      // Add events to new target
      enterEvents.forEach((name) => target.addEventListener(name, this.show));
      leaveEvents.forEach((name) => target.addEventListener(name, this.hide));
    }
    this._target = target;
  }

  show = () => {
    this.style.cssText = "";
    computePosition(this.target, this, {
      strategy: "fixed",
      middleware: [
        offset(this.offset),
        shift(),
        flip(),
        autoPlacement({ allowedPlacements: ["top", "bottom"] }),
      ],
    }).then(({ x, y }) => {
      this.style.left = `${x}px`;
      this.style.top = `${y}px`;
    });
    this.showing = true;
  };

  hide = () => {
    this.showing = false;
  };

  finishHide = () => {
    if (!this.showing) {
      this.style.display = "none";
    }
  };

  render() {
    return html`<slot></slot>`;
  }
}
customElements.define("il-tooltip", Tooltip);

class TooltipDirective extends Directive {
  didSetupLazy = false;
  tooltipContent;
  part;
  tooltip;
  render(tooltipContent = "") {}
  update(part, [tooltipContent]) {
    this.tooltipContent = tooltipContent;
    this.part = part;
    if (!this.didSetupLazy) {
      this.setupLazy();
    }
    if (this.tooltip) {
      this.renderTooltipContent();
    }
  }
  setupLazy() {
    this.didSetupLazy = true;
    Tooltip.lazy(this.part.element, (tooltip) => {
      this.tooltip = tooltip;
      this.renderTooltipContent();
    });
  }
  renderTooltipContent() {
    render(this.tooltipContent, this.tooltip, this.part.options);
  }
}

export const tooltip = directive(TooltipDirective);
