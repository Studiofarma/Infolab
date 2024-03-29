import { html, css } from "lit";
import { when } from "lit/directives/when.js";

import { HtmlParserService } from "./../../../services/html-parser-service";
import { ThemeColorService } from "../../../services/theme-color-service";

import { ConversationDto } from "../../../models/conversation-dto";

import { ThemeCSSVariables } from "../../../enums/theme-css-variables";

import { BaseComponent } from "../../../components/base-component";
import { UserDto } from "../../../models/user-dto";
import { UsersService } from "../../../services/users-service";

export class MessageContent extends BaseComponent {
  static properties = {
    message: { type: Object },
    activeChatName: { type: String },
    activeConversation: { type: ConversationDto },
    roomType: { type: String },
    user: { type: Object },
    loggedUser: { type: UserDto },
  };

  async connectedCallback() {
    super.connectedCallback();

    this.loggedUser = await UsersService.getLoggedUser();
  }

  static styles = css`
    * {
      margin: 0;
      padding: 0;
      ${ThemeColorService.getThemeVariables()};
    }

    .sender,
    .receiver {
      list-style-position: inside;
      position: relative;
      min-width: 300px;
      max-width: 500px;
      padding: 8px 8px 6px 10px;
      box-shadow: ${ThemeCSSVariables.boxShadowSecondary} 0px 1px 4px;
      z-index: 3;
    }

    .sender {
      border-radius: 10px 0 10px 10px;
      color: ${ThemeCSSVariables.messageSenderText};
      background-color: ${ThemeCSSVariables.messageSenderBg};
    }

    .sender::after {
      // importo anche qua il servizio per rendere visibili le variabili nello pseudo-elemento
      ${ThemeColorService.getThemeVariables()};
      content: "";
      position: absolute;
      top: 0px;
      right: -9px;
      border-top: 10px solid ${ThemeCSSVariables.messageSenderBg};
      border-left: 0px solid transparent;
      border-right: 10px solid transparent;
      z-index: 3;
    }

    .sender::before {
      // importo anche qua il servizio per rendere visibili le variabili nello pseudo-elemento
      ${ThemeColorService.getThemeVariables()};
      content: "";
      position: absolute;
      top: -1px;
      right: -13px;
      border-top: 11px solid ${ThemeCSSVariables.boxShadowSecondary};
      border-left: 0px solid transparent;
      border-right: 12px solid transparent;
      filter: blur(0.8px);
      z-index: 2;
    }

    .receiver {
      border-radius: 0 10px 10px 10px;
      color: ${ThemeCSSVariables.messageReceiverText};
      background-color: ${ThemeCSSVariables.messageReceiverBg};
    }

    .receiver::after {
      // importo anche qua il servizio per rendere visibili le variabili nello pseudo-elemento
      ${ThemeColorService.getThemeVariables()};
      content: "";
      position: absolute;
      top: 0px;
      left: -9px;
      border-top: 10px solid ${ThemeCSSVariables.messageReceiverBg};
      border-left: 10px solid transparent;
      border-right: 0px solid transparent;
      z-index: 3;
    }

    .receiver::before {
      // importo anche qua il servizio per rendere visibili le variabili nello pseudo-elemento
      ${ThemeColorService.getThemeVariables()};
      content: "";
      position: absolute;
      top: -1px;
      left: -13px;
      border-top: 11px solid ${ThemeCSSVariables.boxShadowSecondary};
      border-right: 0px solid transparent;
      border-left: 12px solid transparent;
      filter: blur(0.8px);
      z-index: 2;
    }

    .receiver-name {
      font-size: 13px;
      font-weight: bold;
    }

    .message {
      overflow-wrap: break-word;
    }

    .settings-container {
      position: relative;
      background: ${ThemeCSSVariables.messageMenuBg};
      border-radius: 6px;
      box-shadow: ${ThemeCSSVariables.boxShadowSecondary} 0px 1px 4px;
      opacity: 0;
      transition: opacity 0.5s;
    }

    *:hover .settings-container {
      opacity: 1;
    }

    .sender ~ .settings-container il-message-settings {
      position: absolute;
      top: 0px;
      left: -89px;
    }

    .receiver ~ .settings-container il-message-settings {
      position: absolute;
      top: 0px;
      right: 33px;
    }

    .message-timestamp {
      text-align: end;
      font-size: 11px;
    }

    .sender .message-timestamp {
      color: ${ThemeCSSVariables.timestampMessageTextSender};
    }

    .receiver .message-timestamp {
      color: ${ThemeCSSVariables.timestampMessageTextReceiver};
    }

    .edited {
      text-align: end;
      font-size: 11px;
      color: ${ThemeCSSVariables.modifiedMessageText};
      margin-right: 10px;
    }

    .deleted {
      text-align: end;
      font-size: 11px;
      color: ${ThemeCSSVariables.deletedMessageText};
    }

    .timestamp-edited-container {
      display: flex;
      flex-direction: row;
      justify-content: right;
      align-items: center;
    }

    .timestamp-deleted-container {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
    }

    .message-date {
      justify-self: center;
      padding: 5px;
      border-radius: 6px;
      background-color: ${ThemeCSSVariables.datetimeMessageBg};
    }

    .message a[href] {
      color: ${ThemeCSSVariables.link};
      text-underline-position: below;
      text-underline-offset: 2px;
      transition: color 0.5s;
    }
  `;

  render() {
    return html`
        <main>
          <div
            class=${
              this.message.sender == this.loggedUser?.name
                ? "sender"
                : "receiver"
            }
          >
            ${when(
              this.activeConversation?.roomType ===
                ConversationDto.roomTypeEnum.group,
              () =>
                html` <p
                  data-cy="receiver-name"
                  class="receiver-name"
                  style="color: ${ThemeColorService.getColorForUser(
                    this.user?.id,
                    0
                  )}"
                >
                  ${when(
                    this.message.sender != this.loggedUser?.name,
                    () => this.user?.description
                  )}
                </p>`
            )}
            ${when(
              !this.message.hasBeenDeleted(),
              () => html`
                <p data-cy="message" class="message">
                  ${HtmlParserService.parseFromString(this.message.content)}
                </p>
              `,
              () => html``
            )}

            <div
              class=${
                this.message.hasBeenDeleted()
                  ? "timestamp-deleted-container"
                  : "timestamp-edited-container"
              }
            >
              ${when(
                this.message.hasBeenEdited(),
                () => html`<p class="edited">Modificato</p>`,
                () => html``
              )}
              ${when(
                this.message.hasBeenDeleted(),
                () =>
                  html`<p data-cy="deleted" class="deleted">
                    Questo messaggio è stato eliminato
                  </p>`,
                () => html``
              )}
              <p data-cy="message-timestamp" class="message-timestamp">
                ${new Date(this.message.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        </main>
      </div>
    `;
  }
}

customElements.define("il-message-content", MessageContent);
