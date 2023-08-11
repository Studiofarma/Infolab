import { LitElement, css, html } from "lit";
import { when } from "lit/directives/when.js";

import "./circular-progress-bar";

export class InfiniteScroll extends LitElement {
  static properties = {
    isReverse: { type: Boolean },
    scrollableElem: { type: Object },
    hasMoreNext: { type: Boolean },
    threshold: { type: Number },
    isLoadMoreNext: { type: Boolean },
    beforeScrollHeight: { type: Number },
    beforeScrollTop: { type: Number },
  };

  constructor() {
    super();

    this.hasMoreNext = true;
    this.isLoadMoreNext = false;
  }

  static styles = css`
    .progress-container {
      display: flex;
      flex-direction: row;
      justify-content: center;
    }
  `;

  updated(changedProperties) {
    if (changedProperties.has("scrollableElem")) {
      const element = this.scrollableElem;

      if (this.isReverse) {
        element.scrollTop = element.scrollHeight;
      }

      element?.addEventListener("scroll", this.onScroll);
      element?.addEventListener("resize", this.onScroll);
    }
  }

  onScroll(e) {
    if (!this.hasMoreNext) return;

    let offset = 0;

    if (this.isReverse) {
      offset = e.target.scrollTop;
    } else {
      offset =
        e.target.scrollHeight - e.target.clientHeight - e.target.scrollTop;
    }

    if (offset <= this.threshold) {
      if (!this.isLoadMoreNext && this.hasMoreNext) {
        this.dispatchEvent(new CustomEvent("il:updated-next"));
        this.beforeScrollHeight = e.target.scrollHeight;
        this.beforeScrollTop = e.target.scrollTop;

        this.isLoadMoreNext = true;
      }
    } else {
      this.isLoadMoreNext = false;
    }
  }

  updateScrollPosition() {
    if (this.isLoadMoreNext && this.isReverse) {
      const element = this.scrollableElem;

      element.scrollTop =
        element.scrollHeight - this.beforeScrollHeight + this.beforeScrollTop;

      this.isLoadMoreNext = false;
    }
  }

  render() {
    return html`
      <div class="container">
        ${when(
          this.isReverse,
          () => html`
            ${when(
              this.hasMoreNext,
              () =>
                html`<div class="progress-container">
                  <il-circular-progress-bar></il-circular-progress-bar>
                </div>`,
              () => html``
            )}
            <slot></slot>
          `,
          () => html`
            <slot></slot>
            ${when(
              this.hasMoreNext,
              () =>
                html`<div class="progress-container">
                  <il-circular-progress-bar></il-circular-progress-bar>
                </div>`,
              () => html``
            )}
          `
        )}
      </div>
    `;
  }
}

customElements.define("il-infinite-scroll", InfiniteScroll);
