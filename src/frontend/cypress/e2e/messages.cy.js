const MESSAGE_LIST_PATH = "il-app ,il-chat, il-messages-list";
const MESSAGE_PATH = "il-app, il-chat, il-messages-list, il-message";
const MESSAGE_CONTENT_PATH =
  "il-app, il-chat, il-messages-list, il-message, il-message-content";
const ICON_BUTTON_PATH =
  "il-app, il-chat, il-messages-list, il-message, il-message-menu-popover, il-button-icon";
const MESSAGE_OPTIONS_PATH =
  "il-app ,il-chat, il-messages-list, il-message, il-message-menu-popover, il-message-options";
const MESSAGE_MENU_POPOVER_PATH =
  "il-app ,il-chat, il-messages-list, il-message, il-message-menu-popover";
const MESSAGE_BUTTON_OPTION_PATH =
  "il-app ,il-chat, il-messages-list, il-message, il-message-menu-popover, il-message-options, message-button-option";

// Il primo è per le conversazioni della sidebar, il secondo per quelli della forward-list
const SIDEBAR_CONVERSATION_PATH =
  "il-app, il-chat, il-sidebar, il-conversation-list, il-conversation";
const CONVERSATION_PATH =
  "il-app, il-chat, il-conversation-list, il-conversation";

const BUTTON_TEXT_PATH = "il-app,il-chat, il-conversation-list, il-button-text";
const SIDEBAR_CONVERSATION_LIST =
  "il-app, il-chat, il-sidebar, il-conversation-list";

beforeEach(() => {
  // login
  cy.login({ user: "user1", password: "password1" });

  // opening the general chat
  cy.openChat("Generale");
});

describe("messages spec", () => {
  it("asserting that the messages container exists ", () => {
    cy.litElementExist(MESSAGE_LIST_PATH);
    // sending some test messages in case they aren't present by default
    cy.sendTestMessages(2);
    cy.litElementExist(MESSAGE_PATH);
  });

  //-----------------------------------------------------
  //-----------------------------------------------------

  it("asserting that messages contain the content and the timestamp)", () => {
    cy.litElementExist(MESSAGE_CONTENT_PATH);
    cy.getLitElement(MESSAGE_CONTENT_PATH)
      .first()
      .find(".message")
      .should("exist")
      .and("not.to.be.empty");
    cy.getLitElement(MESSAGE_CONTENT_PATH)
      .first()
      .find(".message-timestamp")
      .should("exist")
      .and("not.to.be.empty");
  });

  //-----------------------------------------------------
  //-----------------------------------------------------

  it("asserting that in the general chat, the received messages contain the sender info", () => {
    cy.getLitElement(MESSAGE_CONTENT_PATH)
      .find("main")
      .filter(":has(.receiver-name)")
      .first()
      .then((element) => {
        cy.wrap(element).find(".receiver-name").should("not.to.be.empty");
      });
  });

  //-----------------------------------------------------
  //-----------------------------------------------------

  it("asserting that the options menu icon will display when you hover on a message", () => {
    cy.getLitElement(MESSAGE_PATH)
      .first()
      .find(".message-body")
      .trigger("mouseover", { force: true });
    cy.getLitElement(ICON_BUTTON_PATH)
      .find(".icon-button")
      .should("be.visible");
  });

  //-----------------------------------------------------
  //-----------------------------------------------------
  it("asserting that the options menu displays his content after clicking on his icon", () => {
    cy.getLitElement(MESSAGE_PATH)
      .first()
      .find(".message-body")
      .trigger("mouseover", { force: true });
    cy.getLitElement(ICON_BUTTON_PATH)
      .first()
      .find(".icon-button")
      .click({ force: true });
    cy.getLitElement(MESSAGE_OPTIONS_PATH)
      .find("div")
      .should("be.visible")
      .and("not.to.be.empty");
  });

  //-----------------------------------------------------
  //-----------------------------------------------------
  it("asserting that the button 'Copia' works", () => {
    //sending the message 'test1'
    cy.sendTestMessages(1);
    // hover on the message
    cy.getLitElement(MESSAGE_PATH)
      .last()
      .find(".message-body")
      .trigger("mouseover", { force: true });
    // opening the menu
    cy.getLitElement(ICON_BUTTON_PATH)
      .last()
      .find(".icon-button")
      .click({ force: true });
    // clicking on 'copia' button
    cy.getLitElement(MESSAGE_MENU_POPOVER_PATH)
      .last()
      .find("il-message-options")
      .shadow()
      .find("message-button-option")
      .first()
      .shadow()
      .find("div")
      .click({ force: true });
    // checking the clipboard content
    cy.window().then((win) => {
      win.navigator.clipboard.readText().then((text) => {
        expect(text).to.eq("test1");
      });
    });
  });

  //-----------------------------------------------------
  //-----------------------------------------------------
  it("asserting that the button 'Inoltra' works (SINGLE FORWARD)", () => {
    // hover on the message
    cy.getLitElement(MESSAGE_PATH)
      .first()
      .find(".message-body")
      .trigger("mouseover", { force: true });
    // opening the menu
    cy.getLitElement(ICON_BUTTON_PATH)
      .first()
      .find(".icon-button")
      .click({ force: true });
    //  click on the 'Inoltra' button
    cy.getLitElement(MESSAGE_BUTTON_OPTION_PATH)
      .eq(1)
      .find("div")
      .click({ force: true });
    // getting the text of the forwarded message
    cy.getLitElement(MESSAGE_CONTENT_PATH)
      .first()
      .find(".message")
      .invoke("text")
      .then((txt) => {
        cy.getLitElement(CONVERSATION_PATH)
          .find(".chat-name")
          .first()
          .click({ force: true });
        //check if  the check icon is visible
        cy.getLitElement(CONVERSATION_PATH)
          .find(".chat-box")
          .first()
          .find("il-avatar")
          .shadow()
          .find(".icon-button")
          .should("be.visible");
        // check if the 'Inoltra' button is visible
        cy.getLitElement(BUTTON_TEXT_PATH).find("button").should("be.visible");
        // forwarding a message only to Fabrizio Bruno
        cy.getLitElement(BUTTON_TEXT_PATH)
          .find("button")
          .click({ force: true });
        cy.getLitElement(MESSAGE_CONTENT_PATH)
          .last()
          .find(".message")
          .should("have.text", txt);
      });
  });

  //-----------------------------------------------------
  //-----------------------------------------------------
  it("asserting that the button 'Inoltra' works (MULTIPLE FORWARD)", () => {
    // hover on the message
    cy.getLitElement(MESSAGE_PATH)
      .first()
      .find(".message-body")
      .trigger("mouseover", { force: true });
    // opening the menu
    cy.getLitElement(ICON_BUTTON_PATH)
      .first()
      .find(".icon-button")
      .click({ force: true });
    //  click on the 'Inoltra' button
    cy.getLitElement(MESSAGE_BUTTON_OPTION_PATH)
      .eq(1)
      .find("div")
      .click({ force: true });
    // getting the text of the forwarded message
    cy.getLitElement(MESSAGE_CONTENT_PATH)
      .first()
      .find(".message")
      .invoke("text")
      .then((txt) => {
        for (let i = 0; i < 2; i++) {
          cy.getLitElement(CONVERSATION_PATH)
            .find(".chat-name")
            .eq(i)
            .click({ force: true });
        }

        // forwarding a message to multiple conversations
        cy.getLitElement(BUTTON_TEXT_PATH)
          .find("button")
          .click({ force: true });

        // checking if message has been forwarded
        for (let i = 0; i < 2; i++) {
          cy.getLitElement(SIDEBAR_CONVERSATION_PATH)
            .find(".chat-name")
            .eq(i)
            .invoke("text")
            .then((conversationName) => {
              cy.openChat(conversationName);

              cy.getLitElement(MESSAGE_CONTENT_PATH)
                .last()
                .find(".message")
                .should("have.text", txt);
            });
        }
      });
  });

  //-----------------------------------------------------
  //-----------------------------------------------------

  it("asserting that the button 'Scrivi in privato' works", () => {
    cy.sendTestMessages(1);

    Cypress.session.clearAllSavedSessions();

    cy.login({ user: "user2", password: "password2" });

    cy.openChat("Generale");

    // hover on the last message sended by Mario Rossi
    cy.getLitElement(MESSAGE_PATH)
      .last()
      .find(".message-body")
      .trigger("mouseover", { force: true });

    // opening the menu options
    cy.getLitElement(ICON_BUTTON_PATH)
      .last()
      .find(".icon-button")
      .click({ force: true });

    // clicking the 'Scrivi in privato' button
    cy.getLitElement(MESSAGE_MENU_POPOVER_PATH)
      .last()
      .find("il-message-options")
      .shadow()
      .find("message-button-option")
      .eq(2)
      .shadow()
      .find("div")
      .click({ force: true });

    // asserting that user2 has been moved to user1's chat

    cy.getLitElement(SIDEBAR_CONVERSATION_LIST)
      .find("il-conversation.active")
      .shadow()
      .find(".chat-name")
      .should("have.text", "Mario Rossi");
  });
});

afterEach(() => {
  Cypress.session.clearAllSavedSessions();
});
