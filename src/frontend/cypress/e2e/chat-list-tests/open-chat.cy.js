describe("open chat spec", () => {
  it("open first chat", () => {
    cy.getConversationName(0).then((text) => {
      cy.openChatByClick(0);

      cy.checkOpenedConversationName(text);
    });
  });

  it("open last chat", () => {
    cy.getConversationName(-1).then((text) => {
      cy.openChatByClick(-1);

      cy.checkOpenedConversationName(text);
    });
  });

  it("open second chat with arrows", () => {
    cy.getConversationName(1).then((text) => {
      cy.openChatWithArrows(2);

      cy.checkOpenedConversationName(text);
    });
  });

  it("open third chat with arrows", () => {
    cy.getConversationName(2).then((text) => {
      cy.openChatWithArrows(3);

      cy.checkOpenedConversationName(text);
    });
  });
});

afterEach(() => {
  Cypress.session.clearAllSavedSessions();
});

beforeEach(() => {
  cy.login({ user: "user1", password: "password1" });
  cy.wait(1000);
});
