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
    this.progressBarNextRef = createRef();
    this.progressBarPrevRef = createRef();
  }

  firstUpdated() {
    super.firstUpdated();
    this.observerNext = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        console.log("We1");
        const customEvent = new CustomEvent("il:update-next");
        this.lastUpdatePrevOrNextEvent = customEvent;
        this.dispatchEvent(customEvent);
      }
    });

    this.observerNext.observe(this.progressBarNextRef.value);

    this.observerPrev = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        console.log("We2");
        const customEvent = new CustomEvent("il:update-prev");
        this.lastUpdatePrevOrNextEvent = customEvent;
        this.dispatchEvent(customEvent);
      }
    });

    this.observerPrev.observe(this.progressBarPrevRef.value);
  }

  static styles = css``;

  unobserve() {
    this.observerNext.unobserve(this.progressBarNextRef.value);
    this.observerPrev.unobserve(this.progressBarPrevRef.value);
  }

  checkSlotItmesNumber(event) {
    const slot = event.target;

    if (slot.assignedElements().length > 21) {
      console.log("Ahia");
      console.log(this.lastUpdatePrevOrNextEvent);
      if (this.lastUpdatePrevOrNextEvent.type === "il:update-next") {
        console.log("Remove prev");
        this.dispatchEvent(new CustomEvent("il:update-remove-prev"));
      } else {
        console.log("Remove next");
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
              <div ${ref(this.progressBarNextRef)}>Progress bar next page</div>
              <slot @slotchange=${this.checkSlotItmesNumber}></slot>
              <div ${ref(this.progressBarPrevRef)}>Progress bar prev</div>
            `,
          ],
          [
            "bottom",
            () => html`
              <div ${ref(this.progressBarPrevRef)}>Progress bar prev</div>
              <slot @slotchange=${this.checkSlotItmesNumber}></slot>
              <div ${ref(this.progressBarNextRef)}>Progress bar</div>
            `,
          ],
        ],
        () => html` <h1>INVALID PARAM</h1>`
      )}
    `;
  }
}

customElements.define("il-infinite-scroll", InfiniteScroll);
