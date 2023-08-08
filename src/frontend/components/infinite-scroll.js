import { LitElement, css, html } from "lit";
import { createRef, ref } from "lit/directives/ref.js";

export class InfiniteScroll extends LitElement {
  static properties = {};

  constructor() {
    super();
    this.observer = null;
    this.progressBarRef = createRef();
  }

  firstUpdated() {
    super.firstUpdated();
    this.observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        this.dispatchEvent(new CustomEvent("update-next"));
      }
    });

    this.observer.observe(this.progressBarRef.value);
  }

  static styles = css``;

  unobserve() {
    this.observer.unobserve(this.progressBarRef.value);
  }

  render() {
    return html`
      <slot></slot>
      <div id="progress-bar" ${ref(this.progressBarRef)}>Progress bar</div>
    `;
  }
}

customElements.define("il-infinite-scroll", InfiniteScroll);
