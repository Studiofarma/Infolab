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
});

afterEach(() => {
  Cypress.session.clearAllSavedSessions();
});
