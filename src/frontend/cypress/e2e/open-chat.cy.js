const { random } = require("lodash");

describe("open chat spec", () => {
  it("open first chat", () => {
    cy.login({ user: "user1", password: "password1" });

    cy.getLitElement("il-app,il-chat,il-sidebar,il-conversation-list")
      .find("il-conversation")
      .first()
      .click({ force: true });

    cy.countElements("il-app,il-chat,il-chat-header", "il-avatar", 2);
  });

  it("open last chat", () => {
    cy.login({ user: "user1", password: "password1" });

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
