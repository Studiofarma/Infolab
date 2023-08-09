import { LitElement, css, html } from "lit";
import { createRef, ref } from "lit/directives/ref.js";
import { choose } from "lit/directives/choose.js";

export class InfiniteScroll extends LitElement {
  static properties = {
    nextPagePos: { type: String },
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

  updated(changedProperties) {
    if (changedProperties.has("scrollableElem")) {
      const element = this.scrollableElem;

      if (this.nextPagePos === "top") {
        element.scrollTop = element.scrollHeight;
      }

      element.addEventListener("scroll", this.onScroll);
      element.addEventListener("resize", this.onScroll);
    }
  }

  onScroll(e) {
    if (!this.hasMore) return;

    let offset = 0;

    if (this.nextPagePos === "top") {
      offset = e.target.scrollTop;
    } else {
      offset =
        e.target.scrollHeight - e.target.clientHeight - e.target.scrollTop;
    }

    console.log(offset);

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
    if (this.isLoadMore && this.nextPagePos === "top") {
      const element = this.scrollableElem;

      console.log("hello");

      element.scrollTop =
        element.scrollHeight - this.beforeScrollHeight + this.beforeScrollTop;

      this.isLoadMore = false;
    }
  }

  static styles = css``;

  render() {
    return html`
      <div class="container">
        <slot></slot>
      </div>
    `;
  }
}

customElements.define("il-infinite-scroll", InfiniteScroll);
