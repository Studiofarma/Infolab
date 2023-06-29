describe("open chat spec", () => {
  it("open first chat", () => {
    cy.getLitElement(
      "il-app,il-chat,il-sidebar,il-conversation-list,il-conversation"
    )
      .find(".chat-box")
      .first()
      .click({ force: true });

    cy.getCookie("last-chat", { domain: "localhost" }).should("exist");
  });

  it("open last chat", () => {
    cy.getLitElement("il-app,il-chat,il-sidebar,il-conversation-list")
      .find("il-conversation")
      .last()
      .click({ force: true });

    cy.getCookie("last-chat", { domain: "localhost" }).should("exist");
  });

  it("open second chat with arrows", () => {
    cy.getLitElement(
      "il-app,il-chat,il-sidebar,il-conversation-list,il-search,il-input-ricerca"
    )
      .find("input")
      .type("{downArrow}{downArrow}{enter}", {
        force: true,
        parseSpecialCharSequences: true,
      });

    cy.getCookie("last-chat", { domain: "localhost" }).should("exist");
  });

  it("open third chat with arrows", () => {
    cy.getLitElement(
      "il-app,il-chat,il-sidebar,il-conversation-list,il-search,il-input-ricerca"
    )
      .find("input")
      .type("{downArrow}{downArrow}{downArrow}{downArrow}{upArrow}{enter}", {
        force: true,
        parseSpecialCharSequences: true,
      });

    cy.getCookie("last-chat", { domain: "localhost" }).should("exist");
  });
});

afterEach(() => {
  Cypress.session.clearAllSavedSessions();
});

beforeEach(() => {
  cy.login({ user: "user1", password: "password1" });
  cy.wait(1000);
});
