const conversationListPath = "il-app,il-chat,il-sidebar,il-conversation-list";

const inputRicercaSidebarPath = `${conversationListPath},il-search,il-input-ricerca, il-input-with-icon`;

const conversation = "il-conversation";

describe("open chat spec", () => {
  it("open first chat", () => {
    cy.getLitElement(conversationListPath)
      .find(conversation)
      .first()
      .shadow()
      .find(".chat-box")
      .click({ force: true });

    cy.getCookie("last-description", { domain: "localhost" }).then((cookie) => {
      cy.getLitElement(conversationListPath)
        .find(conversation)
        .first()
        .shadow()
        .find(".chat-name")
        .should("have.text", cookie.value);
    });
  });

  it("open last chat", () => {
    cy.getLitElement(conversationListPath)
      .find(conversation)
      .last()
      .shadow()
      .find(".chat-box")
      .click({ force: true });

    cy.getCookie("last-description", { domain: "localhost" }).then((cookie) => {
      cy.getLitElement(conversationListPath)
        .find(conversation)
        .last()
        .shadow()
        .find(".chat-name")
        .should("have.text", cookie.value);
    });
  });

  it("open second chat with arrows", () => {
    cy.getLitElement(inputRicercaSidebarPath)
      .find("input")
      .type("{downArrow}{downArrow}{enter}", {
        force: true,
        parseSpecialCharSequences: true,
      });

    cy.getCookie("last-description", { domain: "localhost" }).then((cookie) => {
      cy.getLitElement(conversationListPath)
        .find(conversation)
        .eq(1)
        .shadow()
        .find(".chat-name")
        .should("have.text", cookie.value);
    });
  });

  it("open third chat with arrows", () => {
    cy.getLitElement(inputRicercaSidebarPath)
      .find("input")
      .type("{downArrow}{downArrow}{downArrow}{downArrow}{upArrow}{enter}", {
        force: true,
        parseSpecialCharSequences: true,
      });

    cy.getCookie("last-description", { domain: "localhost" }).then((cookie) => {
      cy.getLitElement(conversationListPath)
        .find(conversation)
        .eq(2)
        .shadow()
        .find(".chat-name")
        .should("have.text", cookie.value);
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
