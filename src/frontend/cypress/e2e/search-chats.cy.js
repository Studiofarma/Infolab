describe("search spec", () => {
  it("filter all", () => {
    cy.login({ user: "user1", password: "password1" });

    cy.getLitElement(
      "il-app,il-chat,il-sidebar,il-conversation-list,il-search,il-input-ricerca"
    )
      .find("input")
      .type("test", { force: true });

    cy.countElements(
      "il-app,il-chat,il-sidebar,il-conversation-list",
      "il-conversation",
      0
    );
  });

  it("serch user1", () => {
    cy.login({ user: "user1", password: "password1" });

    cy.getLitElement(
      "il-app,il-chat,il-sidebar,il-conversation-list,il-search,il-input-ricerca"
    )
      .find("input")
      .type("user1", { force: true });

    cy.countElements(
      "il-app,il-chat,il-sidebar,il-conversation-list",
      "il-conversation",
      6
    );
  });

  it("clean search", () => {
    cy.login({ user: "user1", password: "password1" });

    cy.getLitElement(
      "il-app,il-chat,il-sidebar,il-conversation-list,il-search,il-input-ricerca"
    )
      .find("input")
      .type("test", { force: true });

    cy.getLitElement(
      "il-app,il-chat,il-sidebar,il-conversation-list,il-search,il-input-ricerca,il-button-icon"
    )
      .find("div")
      .click({ force: true });

    cy.countElements(
      "il-app,il-chat,il-sidebar,il-conversation-list",
      "il-conversation",
      7
    );
  });
});

afterEach(() => {
  Cypress.session.clearAllSavedSessions();
});
