import { LitElement, css, html } from "lit";
import { createRef, ref } from "lit/directives/ref.js";
import { when } from "lit/directives/when.js";

import "./circular-progress-bar";

export class InfiniteScroll extends LitElement {
  static properties = {
    isReverse: { type: Boolean },
    scrollableElem: { type: Object },
    hasMore: { type: Boolean },
    threshold: { type: Number },
    isLoadMore: { type: Boolean },
    beforeScrollHeight: { type: Number },
    beforeScrollTop: { type: Number },
  };

  constructor() {
    super();

    this.hasMore = true;
    this.threshold = 300;
    this.isLoadMore = false;
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

      element.addEventListener("scroll", this.onScroll);
      element.addEventListener("resize", this.onScroll);
    }
  }

  onScroll(e) {
    if (!this.hasMore) return;

    let offset = 0;

    if (this.isReverse) {
      offset = e.target.scrollTop;
    } else {
      offset =
        e.target.scrollHeight - e.target.clientHeight - e.target.scrollTop;
    }

    if (offset <= this.threshold) {
      if (!this.isLoadMore && this.hasMore) {
        this.dispatchEvent(new CustomEvent("il:update-next"));
        this.beforeScrollHeight = e.target.scrollHeight;
        this.beforeScrollTop = e.target.scrollTop;
      }

      this.isLoadMore = true;
    }
  }

  updateScrollPosition() {
    if (this.isLoadMore && this.isReverse) {
      const element = this.scrollableElem;

      element.scrollTop =
        element.scrollHeight - this.beforeScrollHeight + this.beforeScrollTop;

      this.isLoadMore = false;
    }
  }

  render() {
    return html`
      <div class="container">
        ${when(
          this.isReverse,
          () => html`
            ${when(
              this.hasMore,
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
              this.hasMore,
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
