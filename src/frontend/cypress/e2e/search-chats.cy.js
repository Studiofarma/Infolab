describe("search spec", () => {
  it("filters all", () => {
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

  it("search general", () => {
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
      9
    );
  });

  it("search da", () => {
    cy.login({ user: "user1", password: "password1" });

    cy.getLitElement(
      "il-app,il-chat,il-sidebar,il-conversation-list,il-search,il-input-ricerca"
    )
      .find("input")
      .type("da", { force: true });

    cy.countElements(
      "il-app,il-chat,il-sidebar,il-conversation-list",
      "il-conversation",
      3
    );
  });
});

afterEach(() => {
  Cypress.session.clearAllSavedSessions();
});
