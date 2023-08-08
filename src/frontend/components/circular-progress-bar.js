import { html, css, LitElement } from "lit";

class CircularProgressBar extends LitElement {
  static styles = css`
    .circular-progress {
      position: relative;
      height: 80px;
      width: 80px;
      border-radius: 50%;
      background: conic-gradient(blue 120deg, #ededed 0deg);
      display: flex;
      align-items: center;
      justify-content: center;
      animation-name: rotate;
      animation-duration: 0.8s;
      animation-iteration-count: infinite;
      animation-timing-function: cubic-bezier(0.66, 0.34, 0.34, 0.66);
    }
    .circular-progress::before {
      content: "";
      position: absolute;
      height: 60px;
      width: 60px;
      border-radius: 50%;
      background-color: #ffffff;
    }

    @keyframes rotate {
      from {
        transform: rotate(-60deg);
      }
      to {
        transform: rotate(300deg);
      }
    }
  `;

  render() {
    return html`
      <div>
        <div class="circular-progress">
          <span class="center"></span>
        </div>
      </div>
    `;
  }
}

customElements.define("il-circular-progress-bar", CircularProgressBar);
