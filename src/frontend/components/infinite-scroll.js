import { LitElement, css, html } from "lit";
import { createRef, ref } from "lit/directives/ref.js";
import { choose } from "lit/directives/choose.js";

export class InfiniteScroll extends LitElement {
  static properties = {
    nextPagePos: { type: String },
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

  static styles = css`
    // NOTE: to see the triggers assign them a width and color them.
    .trigger-top {
      height: 500px;
      position: relative;
      margin-top: -500px;
      top: 500px;
    }

    .trigger-bottom {
      height: 500px;
      position: relative;
      margin-bottom: -500px;
      bottom: 500px;
    }

    .container {
      display: flex;
      flex-direction: column;
    }
  `;

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
      <div class="container">
        ${choose(
          this.nextPagePos,
          [
            [
              "top",
              () => html`
                <div class="trigger-top" ${ref(this.triggerNextRef)}></div>
                <slot @slotchange=${this.checkSlotItmesNumber}></slot>
                <div class="trigger-bottom" ${ref(this.triggerPrevRef)}></div>
              `,
            ],
            [
              "bottom",
              () => html`
                <div class="trigger-top" ${ref(this.triggerPrevRef)}></div>
                <slot @slotchange=${this.checkSlotItmesNumber}></slot>
                <div class="trigger-bottom" ${ref(this.triggerNextRef)}></div>
              `,
            ],
          ],
          () => html` <h1>INVALID PARAM</h1>`
        )}
      </div>
    `;
  }
}

customElements.define("il-infinite-scroll", InfiniteScroll);
