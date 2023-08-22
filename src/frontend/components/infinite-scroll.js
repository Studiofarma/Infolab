import { LitElement, css, html } from "lit";
import { when } from "lit/directives/when.js";

import "./circular-progress-bar";

export class InfiniteScroll extends LitElement {
  static properties = {
    isReverse: { type: Boolean },
    hasMore: { type: Boolean },
    roomName: { type: String },
    threshold: { type: Number },
    isLoadMore: { type: Boolean },
    beforeScrollHeight: { type: Number },
    beforeScrollTop: { type: Number },
  };

  constructor() {
    super();

    this.hasMore = true;
    this.isLoadMore = false;
    this.roomName = "";
  }

  static styles = css`
    .progress-container {
      display: flex;
      flex-direction: row;
      justify-content: center;
    }
  `;

  updated(changedProperties) {
    if (changedProperties.has("roomName")) {
      const element = this;

      if (this.isReverse) {
        element.scrollTop = element.scrollHeight;
      }

      element?.addEventListener("scroll", this.onScroll);
      element?.addEventListener("resize", this.onScroll);
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
        this.dispatchEvent(new CustomEvent("il:updated-next"));
        this.beforeScrollHeight = e.target.scrollHeight;
        this.beforeScrollTop = e.target.scrollTop;

        this.isLoadMore = true;
      }
    } else {
      this.isLoadMore = false;
    }
  }

  updateScrollPosition() {
    if (this.isLoadMore && this.isReverse) {
      const element = this;

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
