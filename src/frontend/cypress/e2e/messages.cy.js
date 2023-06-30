const CONVERSATION_PATH =
  "il-app, il-chat, il-sidebar, il-conversation-list, il-conversation";
const MESSAGE_PATH = "il-app, il-chat, il-message";
const BUTTON_ICON_PATH = "il-app, il-chat, il-message, il-button-icon";
const OPTIONS_MENU = "il-app, il-chat, il-message, il-message-options";

const FORWARD_LIST_CONVERSATION_PATH =
  "il-app, il-chat, il-conversation-list, il-conversation";

beforeEach(() => {
  // login
  cy.login({ user: "user1", password: "password1" });

  // opening the first chat

  cy.getLitElement(CONVERSATION_PATH)
    .first()
    .find(".chat-name")
    .click({ force: true });
});

function pasteText() {
  return new Cypress.Promise((resolve) =>
    resolve(navigator.clipboard.readText())
  );
}

describe("messages spec", () => {
  it("asserting that the ul.message-box exists and that it isn't empty", () => {
    cy.getLitElement("il-app, il-chat").find(".message-box").should("exist");

    cy.litElementExist(MESSAGE_PATH);
  });

  it("asserting that messages contain all the informations needed (content, timestamp)", () => {
    cy.getLitElement(MESSAGE_PATH).each((messageComponent) => {
      // message content assertion
      cy.wrap(messageComponent).find(".message").should("not.to.be.empty");

      // message timestamp assertion
      cy.wrap(messageComponent)
        .find(".message-timestamp")
        .should("not.to.be.empty");
    });
  });

  it("asserting that, in the general chat, the received messages contain the sender info", () => {
    cy.getLitElement(CONVERSATION_PATH)
      .find(".chat-name")
      .filter(':contains("Generale")')
      .click({ force: true });

    cy.getLitElement(MESSAGE_PATH)
      .find(".message-body")
      .filter(":has(.receiver-name)")
      .each((element) => {
        cy.wrap(element).find(".receiver-name").should("not.to.be.empty");
      });
  });

  it("asserting that the options menu icon will display when you hover on a message", () => {
    cy.getLitElement(MESSAGE_PATH)
      .first()
      .find(".message-body")
      .trigger("mouseover", { force: true });

    cy.getLitElement(BUTTON_ICON_PATH)
      .first()
      .find(".icon-button")
      .should("be.visible");
  });

  it("asserting that the options menu displays his content after clicking on his icon", () => {
    cy.getLitElement(MESSAGE_PATH)
      .first()
      .find(".message-body")
      .trigger("mouseover", { force: true });

    cy.getLitElement(BUTTON_ICON_PATH)
      .first()
      .find(".icon-button")
      .click({ force: true });

    cy.getLitElement("il-app ,il-chat, il-message, il-message-options")
      .find("div")
      .should("be.visible")
      .and("not.to.be.empty");
  });

  it("asserting that the button 'Inoltra' works", () => {
    cy.getLitElement(MESSAGE_PATH)
      .first()
      .find(".message-body")
      .trigger("mouseover", { force: true });

    cy.getLitElement(BUTTON_ICON_PATH)
      .first()
      .find(".icon-button")
      .click({ force: true });

    cy.getLitElement(OPTIONS_MENU)
      .first()
      .find("message-button-option")
      .eq(1)
      .shadow()
      .find("div")
      .click({ force: true });

    cy.getLitElement(MESSAGE_PATH)
      .first()
      .find(".message")
      .invoke("text")
      .then((txt) => {
        cy.getLitElement(FORWARD_LIST_CONVERSATION_PATH)
          .eq(2)
          .find(".chat-name")
          .invoke("text")
          .then((description) => {
            cy.getLitElement(FORWARD_LIST_CONVERSATION_PATH)
              .eq(2)
              .find(".chat-name")
              .click({ force: true });

            cy.getLitElement(CONVERSATION_PATH)
              .first()
              .find(".chat-name")
              .should("have.text", description);

            cy.getLitElement(MESSAGE_PATH)
              .last()
              .find(".message")
              .should("have.text", txt);
          });
      });
  });

  it("asserting that the button 'Elimina' works", () => {
    cy.getLitElement(MESSAGE_PATH)
      .first()
      .find(".message-body")
      .trigger("mouseover", { force: true });

    cy.getLitElement(BUTTON_ICON_PATH)
      .first()
      .find(".icon-button")
      .click({ force: true });

    cy.getLitElement(MESSAGE_PATH)
      .find(".message-body")
      .its("length")
      .then((length) => {
        cy.getLitElement(OPTIONS_MENU)
          .first()
          .find("message-button-option")
          .last()
          .shadow()
          .find("div")
          .click({ force: true });

        cy.getLitElement(MESSAGE_PATH)
          .find(".message-body")
          .should("have.length", length - 1);
      });
  });
});

afterEach(() => {
  Cypress.session.clearAllSavedSessions();
});
