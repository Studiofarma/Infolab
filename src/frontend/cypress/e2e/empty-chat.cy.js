describe("Empty chat component spec", () => {
  it("empty chat exist after login", () => {
    cy.login({ user: "user1", password: "password1" });

    cy.litElementExist("il-app,il-chat,il-empty-chat");
  });
});

afterEach(() => {
  Cypress.session.clearAllSavedSessions();
});
