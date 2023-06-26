describe("chat list render spec", () => {
  it("chat list exist after login", () => {
    cy.login({ user: "user1", password: "password1" });

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
