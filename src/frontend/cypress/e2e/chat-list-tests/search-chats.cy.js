const conversationListPath = "il-app,il-chat,il-sidebar,il-conversation-list";

const inputRicercaSidebarPath =
  conversationListPath + ",il-search,il-input-ricerca";

const conversation = "il-conversation";

describe("search spec", () => {
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

  it("clean search", () => {
    cy.getLitElement(inputRicercaSidebarPath)
      .find("input")
      .type("test", { force: true });

    cy.getLitElement(inputRicercaSidebarPath + ",il-button-icon")
      .find("div")
      .click({ force: true });

    cy.countElements(conversationListPath, conversation, 9);
  });

  it("search da", () => {
    cy.getLitElement(inputRicercaSidebarPath)
      .find("input")
      .type("da", { force: true });

    cy.countElements(conversationListPath, conversation, 3);
  });
});

beforeEach(() => {
  cy.login({ user: "user1", password: "password1" });
});

afterEach(() => {
  Cypress.session.clearAllSavedSessions();
});
