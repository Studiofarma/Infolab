describe("open chat spec", () => {
  it("open first chat", () => {
    cy.getLitElement(
      "il-app,il-chat,il-sidebar,il-conversation-list,il-conversation"
    )
      .find(".chat-box")
      .first()
      .click({ force: true });

    cy.countElements("il-app,il-chat,il-chat-header", "il-avatar", 2);
  });

  it("open last chat", () => {
    cy.getLitElement("il-app,il-chat,il-sidebar,il-conversation-list")
      .find("il-conversation")
      .last()
      .click({ force: true });

    cy.countElements("il-app,il-chat,il-chat-header", "il-avatar", 2);
  });
});

afterEach(() => {
  Cypress.session.clearAllSavedSessions();
});

beforeEach(() => {
  cy.login({ user: "user1", password: "password1" });
});
