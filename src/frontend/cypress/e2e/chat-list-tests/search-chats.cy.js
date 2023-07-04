const conversationListPath = "il-app,il-chat,il-sidebar,il-conversation-list";

const inputRicercaSidebarPath = `${conversationListPath},il-search,il-input-ricerca`;

const buttonIconPath = `${inputRicercaSidebarPath},il-button-icon`;

const conversation = "il-conversation";

describe("search spec", () => {
  it("icon is magnifying glass", () => {
    cy.getLitElement(buttonIconPath)
      .find("il-icon[name*=mdiMagnify]")
      .should("exist");
  });

  it("icon remains magnifying glass on click on input", () => {
    cy.getLitElement(inputRicercaSidebarPath)
      .find("input")
      .click({ force: true });

    cy.getLitElement(buttonIconPath)
      .find("il-icon[name*=mdiMagnify]")
      .should("exist");
  });

  it("icon becomes cross on typing", () => {
    cy.getLitElement(inputRicercaSidebarPath)
      .find("input")
      .type("test", { force: true });

    cy.getLitElement(buttonIconPath)
      .find("il-icon[name*=mdiClose]")
      .should("exist");
  });

  it("filters all", () => {
    cy.getLitElement(inputRicercaSidebarPath)
      .find("input")
      .type("test", { force: true });

    cy.countElements(conversationListPath, conversation, 0);
  });

  it("search general", () => {
    cy.getLitElement(inputRicercaSidebarPath)
      .find("input")
      .type("general", { force: true });

    cy.countElements(conversationListPath, conversation, 1);
  });

  it("search da", () => {
    cy.getLitElement(inputRicercaSidebarPath)
      .find("input")
      .type("da", { force: true });

    cy.countElements(conversationListPath, conversation, 3);
  });

  it("clean search", () => {
    cy.getLitElement(inputRicercaSidebarPath)
      .find("input")
      .type("test", { force: true });

    cy.getLitElement(inputRicercaSidebarPath)
      .find("il-button-icon")
      .click({ force: true });

    cy.getLitElement(inputRicercaSidebarPath)
      .find("input")
      .should("have.value", "");
  });

  it("input clears after chat is selected with click", () => {
    cy.getLitElement(inputRicercaSidebarPath)
      .find("input")
      .type("da", { force: true });

    cy.getLitElement(conversationListPath)
      .find(conversation)
      .last()
      .shadow()
      .find(".chat-box")
      .click({ force: true });

    cy.getLitElement(inputRicercaSidebarPath)
      .find("input")
      .should("have.value", "");
  });

  it("input clears after chat is selected with arrows", () => {
    cy.getLitElement(inputRicercaSidebarPath)
      .find("input")
      .type("d{downArrow}{enter}", {
        force: true,
        delay: 1000,
      });

    cy.getLitElement(inputRicercaSidebarPath)
      .find("input")
      .should("have.value", "");
  });
});

beforeEach(() => {
  cy.login({ user: "user1", password: "password1" });
});

afterEach(() => {
  Cypress.session.clearAllSavedSessions();
});
