describe("chat list render spec", () => {
  it("chat list exist after login", () => {
    cy.login({ user: "user1", password: "password1" });

    cy.countElements(
      "il-app,il-chat,il-sidebar,il-conversation-list",
      "il-conversation",
      7
    );
  });

  it("change chat works", () => {
    cy.login({ user: "user1", password: "password1" });

    cy.getLitElement("il-app,il-chat,il-sidebar,il-conversation-list")
      .find("il-conversation")
      .first()
      .click({ force: true });

    cy.countElements("il-app,il-chat,il-chat-header", "il-avatar", 2);
  });

  it("serch filters chat list", () => {
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
});

afterEach(() => {
  Cypress.session.clearAllSavedSessions();
});
