describe("chat list render spec", () => {
  it("chat list exists after login", () => {
    cy.countElements(
      "il-app,il-chat,il-conversation-list",
      "il-conversation",
      9
    );
  });

  it("separator 'Conversazioni' exists after login", () => {
    cy.getLitElement("il-app,il-chat,il-conversation-list")
      .find(".separator")
      .eq(0)
      .should("have.text", "Conversazioni");
  });

  it("separator 'Nuove conversazioni' exists after login", () => {
    cy.getLitElement("il-app,il-chat,il-conversation-list")
      .contains("Nuove conversazioni")
      .should("exist");
  });

  it("filter exist after login", () => {
    cy.litElementExist("il-app,il-chat,il-conversation-list,il-input-search");
  });
});

beforeEach(() => {
  cy.login({ user: "user1", password: "password1" });
});

afterEach(() => {
  Cypress.session.clearAllSavedSessions();
});
