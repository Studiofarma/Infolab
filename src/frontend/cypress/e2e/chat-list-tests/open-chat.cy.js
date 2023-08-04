const conversationListPath = "il-app,il-chat,il-conversation-list";

const inputRicercaSidebarPath = `${conversationListPath},il-input-search, il-input-with-icon`;

const conversation = "il-conversation";

describe("open chat spec", () => {
  it("open first chat", () => {
    cy.getLitElement(conversationListPath)
      .find(conversation)
      .first()
      .shadow()
      .find(".chat-name")
      .invoke("text")
      .then((text) => {
        cy.getLitElement(conversationListPath)
          .find(conversation)
          .first()
          .shadow()
          .find(".chat-name")
          .click({ force: true })
          .should("have.text", text);
      });
  });

  it("open last chat", () => {
    cy.getLitElement(conversationListPath)
      .find(conversation)
      .last()
      .shadow()
      .find(".chat-name")
      .invoke("text")
      .then((text) => {
        cy.getLitElement(conversationListPath)
          .find(conversation)
          .last()
          .shadow()
          .find(".chat-name")
          .click({ force: true })
          .should("have.text", text);
      });
  });

  it("open second chat with arrows", () => {
    cy.getLitElement(conversationListPath)
      .find(conversation)
      .eq(1)
      .shadow()
      .find(".chat-name")
      .invoke("text")
      .then((text) => {
        cy.getLitElement(inputRicercaSidebarPath)
          .find("input")
          .type("{downArrow}{downArrow}{enter}", {
            force: true,
            parseSpecialCharSequences: true,
          });

        cy.getLitElement(conversationListPath)
          .find(conversation)
          .eq(1)
          .shadow()
          .find(".chat-name")
          .should("have.text", text);
      });
  });

  it("open third chat with arrows", () => {
    cy.getLitElement(conversationListPath)
      .find(conversation)
      .eq(2)
      .shadow()
      .find(".chat-name")
      .invoke("text")
      .then((text) => {
        cy.getLitElement(inputRicercaSidebarPath)
          .find("input")
          .type(
            "{downArrow}{downArrow}{downArrow}{downArrow}{upArrow}{enter}",
            {
              force: true,
              parseSpecialCharSequences: true,
            }
          );
        cy.getLitElement(conversationListPath)
          .find(conversation)
          .eq(2)
          .shadow()
          .find(".chat-name")
          .should("have.text", text);
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
