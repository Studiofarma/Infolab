const conversationListPath = "il-app,il-chat,il-conversation-list";

describe("chat list render spec", () => {
  it("chat list exists after login", () => {
    cy.countElements(conversationListPath, "il-conversation", 9);
  });

  it("separator 'Conversazioni' exists after login", () => {
    cy.getLitElement(conversationListPath)
      .find(".separator")
      .eq(0)
      .should("have.text", "Conversazioni");
  });

  it("separator 'Nuove conversazioni' exists after login", () => {
    cy.getLitElement(conversationListPath)
      .contains("Nuove conversazioni")
      .should("exist");
  });

  it("filter exist after login", () => {
    cy.litElementExist(`${conversationListPath},il-input-search`);
  });
});

beforeEach(() => {
  cy.login({ user: "user1", password: "password1" });
});

afterEach(() => {
  Cypress.session.clearAllSavedSessions();
});
