import { LitElement, css, html } from "lit";
import { createRef, ref } from "lit/directives/ref.js";
import { choose } from "lit/directives/choose.js";

export class InfiniteScroll extends LitElement {
  static properties = {
    progressBarPos: { type: String },
  };

  constructor() {
    super();

    this.lastUpdatePrevOrNextEvent = null;

    // Observers
    this.observerNext = null;
    this.observerPrev = null;

    // Refs
    this.triggerNextRef = createRef();
    this.triggerPrevRef = createRef();
  }

  firstUpdated() {
    super.firstUpdated();
    this.observerNext = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        const customEvent = new CustomEvent("il:update-next");
        this.lastUpdatePrevOrNextEvent = customEvent;
        this.dispatchEvent(customEvent);
      }
    });

    this.observerNext.observe(this.triggerNextRef.value);

    this.observerPrev = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        const customEvent = new CustomEvent("il:update-prev");
        this.lastUpdatePrevOrNextEvent = customEvent;
        this.dispatchEvent(customEvent);
      }
    });

    this.observerPrev.observe(this.triggerPrevRef.value);
  }

  static styles = css``;

  unobserve() {
    this.observerNext.unobserve(this.triggerNextRef.value);
    this.observerPrev.unobserve(this.triggerPrevRef.value);
  }

  checkSlotItmesNumber(event) {
    const slot = event.target;

    if (slot.assignedElements().length > 21) {
      if (this.lastUpdatePrevOrNextEvent.type === "il:update-next") {
        this.dispatchEvent(new CustomEvent("il:update-remove-prev"));
      } else {
        this.dispatchEvent(new CustomEvent("il:update-remove-next"));
      }
    }
  }

  render() {
    return html`
      ${choose(
        this.progressBarPos,
        [
          [
            "top",
            () => html`
              <div ${ref(this.triggerNextRef)}></div>
              <slot @slotchange=${this.checkSlotItmesNumber}></slot>
              <div ${ref(this.triggerPrevRef)}></div>
            `,
          ],
          [
            "bottom",
            () => html`
              <div ${ref(this.triggerPrevRef)}></div>
              <slot @slotchange=${this.checkSlotItmesNumber}></slot>
              <div ${ref(this.triggerNextRef)}></div>
            `,
          ],
        ],
        () => html` <h1>INVALID PARAM</h1>`
      )}
    `;
  }
}

customElements.define("il-infinite-scroll", InfiniteScroll);
