const inputRicercaSidebar =
  "il-app,il-chat,il-sidebar,il-conversation-list,il-search,il-input-ricerca";

describe("search spec", () => {
  it("filters all", () => {
    cy.getLitElement(inputRicercaSidebar)
      .find("input")
      .type("test", { force: true });

    cy.countElements(
      "il-app,il-chat,il-sidebar,il-conversation-list",
      "il-conversation",
      0
    );
  });

  it("search general", () => {
    cy.getLitElement(inputRicercaSidebar)
      .find("input")
      .type("general", { force: true });

    cy.countElements(
      "il-app,il-chat,il-sidebar,il-conversation-list",
      "il-conversation",
      1
    );
  });

  it("clean search", () => {
    cy.getLitElement(inputRicercaSidebar)
      .find("input")
      .type("test", { force: true });

    cy.getLitElement(inputRicercaSidebar + ",il-button-icon")
      .find("div")
      .click({ force: true });

    cy.countElements(
      "il-app,il-chat,il-sidebar,il-conversation-list",
      "il-conversation",
      9
    );
  });

  it("search da", () => {
    cy.getLitElement(inputRicercaSidebar)
      .find("input")
      .type("da", { force: true });

    cy.countElements(
      "il-app,il-chat,il-sidebar,il-conversation-list",
      "il-conversation",
      3
    );
  });
});

beforeEach(() => {
  cy.login({ user: "user1", password: "password1" });
});

afterEach(() => {
  Cypress.session.clearAllSavedSessions();
});
