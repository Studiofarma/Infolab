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

  it("serch general", () => {
    cy.login({ user: "user1", password: "password1" });

    cy.getLitElement(
      "il-app,il-chat,il-sidebar,il-conversation-list,il-search,il-input-ricerca"
    )
      .find("input")
      .type("general", { force: true });

    cy.countElements(
      "il-app,il-chat,il-sidebar,il-conversation-list",
      "il-conversation",
      1
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
      11
    );
  });
});

afterEach(() => {
  Cypress.session.clearAllSavedSessions();
});
