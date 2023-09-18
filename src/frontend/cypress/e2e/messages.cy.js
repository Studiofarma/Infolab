import { Paths } from "../support/paths-enum";

const messageContentPath = `${Paths.messagePath}, il-message-content`;
const conversationInForwardListPath = `${Paths.chatPath}, #forwardList, il-conversation`;
const buttonTextPath = `${Paths.conversationListPath}, il-button-text`;

const iconButtonComponent = '[data-cy="icon-button"]';
const chatNameComponent = '[data-cy="chat-name"]';
const messageComponent = '[data-cy="message"]';

beforeEach(() => {
  // login
  cy.login({ user: "user1", password: "password1" });

  cy.wait(1000);
  // opening the general chat
  cy.openChat("Generale");
});

// I TEST VENGONO SEMPRE FATTI SULL'ULTIMO MESSAGGIO!!!

describe("messages spec", () => {
  it("asserting that the messages container exists ", () => {
    cy.litElementExist(Paths.messagesListPath);
    // sending some test messages in case they aren't present by default
    cy.sendTestMessages(2);
    cy.litElementExist(Paths.messagePath);
  });
  // // //-----------------------------------------------------
  // // //-----------------------------------------------------
  it("asserting that messages contain the content and the timestamp)", () => {
    cy.clickScrollToBottomButton();
    cy.litElementExist(messageContentPath);
    cy.getLitElement(messageContentPath)
      .first()
      .find(".message")
      .should("exist")
      .and("not.to.be.empty");
    cy.getLitElement(messageContentPath)
      .first()
      .find('[data-cy="message-timestamp"]')
      .should("exist")
      .and("not.to.be.empty");
  });
  // // //-----------------------------------------------------
  // // //-----------------------------------------------------
  it("asserting that in the general chat, the received messages contain the sender info", () => {
    cy.clickScrollToBottomButton();
    cy.getLitElement(messageContentPath)
      .find("main")
      .filter(':has([data-cy="receiver-name"])')
      .first()
      .then((element) => {
        cy.wrap(element)
          .find('[data-cy="receiver-name"]')
          .should("not.to.be.empty");
      });
  });
  // // //-----------------------------------------------------
  // // //-----------------------------------------------------
  it("asserting that the options menu icon will display when you hover on a message", () => {
    cy.clickScrollToBottomButton();
    cy.getLitElement(Paths.messagePath)
      .first()
      .find('[data-cy="message-body"]')
      .trigger("mouseover", { force: true });
    cy.getLitElement(Paths.popoverIconButtonPath)
      .find(iconButtonComponent)
      .should("be.visible");
  });
  // // //-----------------------------------------------------
  // // //-----------------------------------------------------
  it("asserting that the options menu displays his content after clicking on his icon", () => {
    cy.clickScrollToBottomButton();
    cy.hoverOnTheLast();

    cy.clickOnTheLastOptionsMenu();

    cy.getLitElement(Paths.messageOptions)
      .find("div")
      .should("be.visible")
      .and("not.to.be.empty");
  });
  // // //-----------------------------------------------------
  // // //-----------------------------------------------------
  it("asserting that the button 'Copia' works", () => {
    cy.clickScrollToBottomButton();
    cy.sendTestMessages(1);
    cy.hoverOnTheLast();
    cy.clickOnTheLastOptionsMenu();
    cy.getOptionButton("Copia").focus().realClick();

    // checking the clipboard content
    cy.window().then((win) => {
      win.navigator.clipboard.readText().then((text) => {
        expect(text).to.eq("test1");
      });
    });
  });
  // //-----------------------------------------------------
  // //-----------------------------------------------------
  it("asserting that the button 'Inoltra' works (SINGLE FORWARD)", () => {
    cy.clickScrollToBottomButton();
    cy.hoverOnTheLast();
    cy.clickOnTheLastOptionsMenu();
    cy.clickOptionButton("Inoltra");
    // getting the text of the forwarded message
    cy.getLitElement(messageContentPath)
      .last()
      .find(messageComponent)
      .invoke("text")
      .then((txt) => {
        cy.getLitElement(conversationInForwardListPath)
          .first()
          .find(chatNameComponent)
          .click({ force: true });
        //check if  the check icon is visible
        cy.getLitElement(conversationInForwardListPath)
          .first()
          .find('[data-cy="chat-box"]')
          .find("il-avatar")
          .shadow()
          .find(iconButtonComponent)
          .should("be.visible");
        // check if the 'Inoltra' button is visible
        cy.getLitElement(buttonTextPath).find("button").should("be.visible");
        // forwarding a message only to Fabrizio Bruno
        cy.getLitElement(buttonTextPath).find("button").click({ force: true });
        cy.getLitElement(messageContentPath)
          .last()
          .last(messageComponent)
          .should("include.text", txt);
      });
  });
  // // //-----------------------------------------------------
  // // //-----------------------------------------------------
  it("asserting that the button 'Inoltra' works (MULTIPLE FORWARD)", () => {
    cy.clickScrollToBottomButton();
    cy.hoverOnTheLast();
    cy.clickOnTheLastOptionsMenu();
    cy.clickOptionButton("Inoltra");
    // getting the text of the forwarded message
    cy.getLitElement(messageContentPath)
      .last()
      .find(messageComponent)
      .invoke("text")
      .then((txt) => {
        for (let i = 0; i < 2; i++) {
          cy.getLitElement(conversationInForwardListPath)
            .find(chatNameComponent)
            .eq(i)
            .click({ force: true });
        }
        // forwarding a message to multiple conversations
        cy.getLitElement(buttonTextPath).find("button").click({ force: true });
        // checking if message has been forwarded
        for (let i = 0; i < 2; i++) {
          cy.getLitElement(Paths.conversationInConversationListPath)
            .find(chatNameComponent)
            .eq(i)
            .invoke("text")
            .then((conversationName) => {
              cy.openChat(conversationName);
              cy.getLitElement(messageContentPath)
                .last()
                .find(messageComponent)
                .invoke("text")
                .then((text) => {
                  cy.wrap({ value: text.trim() })
                    .its("value")
                    .should("equal", txt.trim());
                });
            });
        }
      });
  });
  // // //-----------------------------------------------------
  // // //-----------------------------------------------------
  it("asserting that the button 'Scrivi in privato' works", () => {
    cy.clickScrollToBottomButton();
    // sending a message to general
    cy.sendTestMessages(1);
    Cypress.session.clearAllSavedSessions();

    // entering as user2
    cy.login({ user: "user2", password: "password2" });
    cy.openChat("Generale");

    // clicking on button 'Scrivi in privato'
    cy.hoverOnTheLast();
    cy.clickOnTheLastOptionsMenu();
    cy.clickOptionButton("Scrivi in privato");
    // asserting that user2 has been moved to user1's chat
    cy.getLitElement(Paths.conversationListPath)
      .find("il-conversation.active")
      .shadow()
      .find(chatNameComponent)
      .invoke("text")
      .then((text) => {
        cy.wrap({ value: text.trim() })
          .its("value")
          .should("equal", "Mario Rossi");
      });
  });
  // // //-----------------------------------------------------
  // // //-----------------------------------------------------
  it("asserting that the button 'Elimina' works", () => {
    cy.clickScrollToBottomButton();
    cy.hoverOnTheLast();
    cy.clickOnTheLastOptionsMenu();
    cy.clickOptionButton("Elimina");

    //confirming the elimination of the message
    cy.getLitElement("il-app, il-chat")
      .find('[data-cy="deletion-confirmation-buttons"] il-button-text')
      .last()
      .shadow()
      .find("button")
      .click({ force: true });

    // asserting that the last message content has been deleted

    cy.getLitElement(messageContentPath)
      .last()
      .find('[data-cy="deleted"]')
      .should("exist")
      .and("include.text", "Questo messaggio è stato eliminato");
  });
});

afterEach(() => {
  Cypress.session.clearAllSavedSessions();
});
