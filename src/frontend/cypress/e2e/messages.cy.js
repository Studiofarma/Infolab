beforeEach(() => {
  cy.login({ user: "user1", password: "password1" });
});

describe("messages spec", () => {
  it("asserting ul.message-box doesn't exist when you have just logged in", () => {
    cy.getLitElement("il-app,il-chat").find(".message-box").should("not.exist");
  });

  it("asserting ul.messages-box exists when you open a chat", () => {
    cy.getLitElement(
      "il-app,il-chat,il-sidebar,il-conversation-list,il-conversation"
    )
      .first()
      .find(".chat-name")
      .click({ force: true });

    cy.getLitElement("il-app,il-chat").find(".message-box").should("exist");
  });

  it("asserting that when I open a new conversation there aren't messages", () => {
    cy.getLitElement(
      "il-app,il-chat,il-sidebar,il-conversation-list, il-conversation"
    )
      .find(".chat-name")
      .last()
      .click({ force: true });

    cy.getLitElement("il-app,il-chat")
      .find(".message-box li")
      .should("not.exist");
  });

  it("asserting that when I open the general chat I have all my previous messages with the content and the timestamp", () => {
    cy.getLitElement(
      "il-app,il-chat,il-sidebar,il-conversation-list,il-conversation"
    )
      .first()
      .find(".chat-name")
      .click({ force: true });

    cy.litElementExist("il-app,il-chat,il-message");

    cy.getLitElement("il-app, il-chat")
      .find("il-message")
      .each((messageComponent) => {
        // message content
        cy.wrap(messageComponent)
          .shadow()
          .find(".message")
          .should("not.to.be.empty");

        // timestamp
        cy.wrap(messageComponent)
          .shadow()
          .find(".message-timestamp")
          .should("not.to.be.empty");
      });
  });

  it("asserting that all the messages in the general chat, that doesn't belong to the user, have the sender info", () => {
    cy.getLitElement(
      "il-app,il-chat,il-sidebar,il-conversation-list,il-conversation"
    )
      .first()
      .find(".chat-name")
      .click({ force: true });

    cy.getLitElement("il-app,il-chat")
      .find("il-message")
      .each((messageComponent) => {
        if (
          cy.wrap(messageComponent).shadow().find(".message-body > div")
            .class === "receiver"
        )
          cy.wrap(messageComponent)
            .shadow()
            .find(".receiver-name")
            .should("not.to.be.empty");
      });
  });

  it("asserting that message date exist", () => {
    cy.getLitElement(
      "il-app,il-chat,il-sidebar,il-conversation-list,il-conversation"
    )
      .first()
      .find(".chat-name")
      .click({ force: true });

    cy.getLitElement("il-app,il-chat")
      .find("il-message")
      .each((messageComponent) => {
        try {
          cy.wrap(messageComponent)
            .shadow()
            .find(".message-date")
            .should("not.to.be.empty");
        } catch (e) {}
      });
  });

  // it("asserting that the message menu appears when you hover on the message-body", () => {

  //   cy.getLitElement(
  //     "il-app,il-chat,il-sidebar,il-conversation-list,il-conversation"
  //   )
  //     .first()
  //     .find(".chat-name")
  //     .click({ force: true });

  //   // hover on a message
  //   // holy shit, DAMN
  // });

  // it("asserting that the scroll-to-button arrow works", () => {
  //   cy.getLitElement(
  //     "il-app,il-chat,il-sidebar,il-conversation-list,il-conversation"
  //   )
  //     .first()
  //     .find(".chat-name")
  //     .click({ force: true });

  //   cy.getLitElement("il-app, il-chat").find(".prova").scrollIntoView().wait(0);

  //   cy.getLitElement("il-app, il-chat")
  //     .find(".scroll-button")
  //     .should("be.visible");
  // });

  it("trying to do some unuseful stuff like typing text in the editor", () => {
    cy.getLitElement(
      "il-app,il-chat,il-sidebar,il-conversation-list,il-conversation"
    )
      .first()
      .find(".chat-name")
      .click({ force: true });

    cy.getLitElement("il-app, il-chat, il-input-controls,il-editor")
      .find("textarea")
      .type("ciao ciao cypress!!!{enter}");
  });
});

afterEach(() => {
  Cypress.session.clearAllSavedSessions();
});
