beforeEach(() => {
  // login
  cy.login({ user: "user1", password: "password1" });

  // opening the general chat
  cy.openChat("Generale");
});

describe("messages spec", () => {
  // it("asserting that the messages container exists ", () => {
  //   cy.litElementExist("il-app ,il-chat, il-messages-list");
  //   // sending some test messages in case they aren't present by default
  //   cy.sendTestMessages(2);
  //   cy.litElementExist("il-app, il-chat, il-messages-list, il-message");
  // });
  // it("asserting that messages contain the content and the timestamp)", () => {
  //   cy.litElementExist(
  //     "il-app, il-chat, il-messages-list, il-message, il-message-content"
  //   );
  //   cy.getLitElement(
  //     "il-app, il-chat, il-messages-list, il-message, il-message-content"
  //   )
  //     .first()
  //     .find(".message")
  //     .should("exist")
  //     .and("not.to.be.empty");
  //   cy.getLitElement(
  //     "il-app, il-chat, il-messages-list, il-message, il-message-content"
  //   )
  //     .first()
  //     .find(".message-timestamp")
  //     .should("exist")
  //     .and("not.to.be.empty");
  // });
  // it("asserting that in the general chat, the received messages contain the sender info", () => {
  //   cy.getLitElement(
  //     "il-app, il-chat, il-messages-list,il-message, il-message-content"
  //   )
  //     .find("main")
  //     .filter(":has(.receiver-name)")
  //     .first()
  //     .then((element) => {
  //       cy.wrap(element).find(".receiver-name").should("not.to.be.empty");
  //     });
  // });
  // it("asserting that the options menu icon will display when you hover on a message", () => {
  //   cy.getLitElement("il-app, il-chat, il-messages-list, il-message")
  //     .first()
  //     .find(".message-body")
  //     .trigger("mouseover", { force: true });
  //   cy.getLitElement(
  //     "il-app, il-chat, il-messages-list, il-message, il-message-menu-popover, il-button-icon"
  //   )
  //     .find(".icon-button")
  //     .should("be.visible");
  // });
  // it("asserting that the options menu displays his content after clicking on his icon", () => {
  //   cy.getLitElement("il-app, il-chat, il-messages-list, il-message")
  //     .first()
  //     .find(".message-body")
  //     .trigger("mouseover", { force: true });
  //   cy.getLitElement(
  //     "il-app, il-chat, il-messages-list, il-message, il-message-menu-popover, il-button-icon"
  //   )
  //     .first()
  //     .find(".icon-button")
  //     .click({ force: true });
  //   cy.getLitElement(
  //     "il-app ,il-chat, il-messages-list, il-message, il-message-menu-popover, il-message-options"
  //   )
  //     .find("div")
  //     .should("be.visible")
  //     .and("not.to.be.empty");
  // });
  // it("asserting that the button 'Copia' works", () => {
  //   //sending the message 'test1'
  //   cy.sendTestMessages(1);
  //   // hover on the message
  //   cy.getLitElement("il-app, il-chat, il-messages-list, il-message")
  //     .last()
  //     .find(".message-body")
  //     .trigger("mouseover", { force: true });
  //   // opening the menu
  //   cy.getLitElement(
  //     "il-app, il-chat, il-messages-list, il-message, il-message-menu-popover, il-button-icon"
  //   )
  //     .last()
  //     .find(".icon-button")
  //     .click({ force: true });
  //   // clicking on 'copia' button
  //   cy.getLitElement(
  //     "il-app ,il-chat, il-messages-list, il-message, il-message-menu-popover"
  //   )
  //     .last()
  //     .find("il-message-options")
  //     .shadow()
  //     .find("message-button-option")
  //     .first()
  //     .shadow()
  //     .find("div")
  //     .click({ force: true });
  //   // checking the clipboard content
  //   cy.window().then((win) => {
  //     win.navigator.clipboard.readText().then((text) => {
  //       expect(text).to.eq("test1");
  //     });
  //   });
  // });
  // it("asserting that the button 'Inoltra' works (SINGLE FORWARD)", () => {
  //   // hover on the message
  //   cy.getLitElement("il-app, il-chat, il-messages-list, il-message")
  //     .first()
  //     .find(".message-body")
  //     .trigger("mouseover", { force: true });
  //   // opening the menu
  //   cy.getLitElement(
  //     "il-app, il-chat, il-messages-list, il-message, il-message-menu-popover, il-button-icon"
  //   )
  //     .first()
  //     .find(".icon-button")
  //     .click({ force: true });
  //   //  click on the 'Inoltra' button
  //   cy.getLitElement(
  //     "il-app ,il-chat, il-messages-list, il-message, il-message-menu-popover, il-message-options, message-button-option"
  //   )
  //     .eq(1)
  //     .find("div")
  //     .click({ force: true });
  //   // getting the text of the forwarded message
  //   cy.getLitElement(
  //     "il-app, il-chat, il-messages-list, il-message, il-message-content"
  //   )
  //     .first()
  //     .find(".message")
  //     .invoke("text")
  //     .then((txt) => {
  //       cy.getLitElement(
  //         "il-app, il-chat, il-conversation-list, il-conversation"
  //       )
  //         .find(".chat-name")
  //         .first()
  //         .click({ force: true });
  //       //check if  the check icon is visible
  //       cy.getLitElement(
  //         "il-app,il-chat, il-conversation-list, il-conversation"
  //       )
  //         .find(".chat-box")
  //         .first()
  //         .find("il-avatar")
  //         .shadow()
  //         .find(".icon-button")
  //         .should("be.visible");
  //       // check if the 'Inoltra' button is visible
  //       cy.getLitElement("il-app,il-chat, il-conversation-list, il-button-text")
  //         .find("button")
  //         .should("be.visible");
  //       // forwarding a message only to Fabrizio Bruno
  //       cy.getLitElement("il-app,il-chat, il-conversation-list, il-button-text")
  //         .find("button")
  //         .click({ force: true });
  //       cy.getLitElement(
  //         "il-app, il-chat, il-messages-list, il-message, il-message-content"
  //       )
  //         .last()
  //         .find(".message")
  //         .should("have.text", txt);
  //     });
  // });

  // it("asserting that the button 'Inoltra' works (MULTIPLE FORWARD)", () => {
  //   // hover on the message
  //   cy.getLitElement("il-app, il-chat, il-messages-list, il-message")
  //     .first()
  //     .find(".message-body")
  //     .trigger("mouseover", { force: true });
  //   // opening the menu
  //   cy.getLitElement(
  //     "il-app, il-chat, il-messages-list, il-message, il-message-menu-popover, il-button-icon"
  //   )
  //     .first()
  //     .find(".icon-button")
  //     .click({ force: true });
  //   //  click on the 'Inoltra' button
  //   cy.getLitElement(
  //     "il-app ,il-chat, il-messages-list, il-message, il-message-menu-popover, il-message-options, message-button-option"
  //   )
  //     .eq(1)
  //     .find("div")
  //     .click({ force: true });
  //   // getting the text of the forwarded message
  //   cy.getLitElement(
  //     "il-app, il-chat, il-messages-list, il-message, il-message-content"
  //   )
  //     .first()
  //     .find(".message")
  //     .invoke("text")
  //     .then((txt) => {
  //       for (let i = 0; i < 2; i++) {
  //         cy.getLitElement(
  //           "il-app, il-chat, il-conversation-list, il-conversation"
  //         )
  //           .find(".chat-name")
  //           .eq(i)
  //           .click({ force: true });
  //       }

  //       // forwarding a message to multiple conversations
  //       cy.getLitElement(
  //         "il-app, il-chat, il-conversation-list, il-button-text"
  //       )
  //         .find("button")
  //         .click({ force: true });

  //       // checking if message has been forwarded
  //       for (let i = 0; i < 2; i++) {
  //         cy.getLitElement(
  //           "il-app, il-chat, il-sidebar, il-conversation-list, il-conversation"
  //         )
  //           .find(".chat-name")
  //           .eq(i)
  //           .invoke("text")
  //           .then((conversationName) => {
  //             cy.openChat(conversationName);

  //             cy.getLitElement(
  //               "il-app, il-chat, il-messages-list, il-message, il-message-content"
  //             )
  //               .last()
  //               .find(".message")
  //               .should("have.text", txt);
  //           });
  //       }
  //     });
  // });

  it("asserting that the button 'Scrivi in privato' works", () => {
    cy.getLitElement(
      "il-app, il-chat, il-messages-list, il-message, il-message-content"
    )
      .find("main > .receiver")
      .find(".receiver-name")
      .first()
      .invoke("text")
      .then((txt) => alert(txt));
  });
});

afterEach(() => {
  Cypress.session.clearAllSavedSessions();
});
