const chatPath = "il-app,il-chat";

const messagePath = `${chatPath}, il-messages-list, il-message`;
const messageMenuPopoverPath = `${messagePath}, il-message-menu-popover`;
const iconButtonPath = `${messageMenuPopoverPath}, il-button-icon`;

const conversationListPath = `${chatPath},il-conversation-list`;
const conversationPath = `${conversationListPath},il-conversation`;

const sidebarInputPath = `${conversationListPath},il-input-search, il-input-with-icon`;

const inputControlsPath = `${chatPath},il-input-controls`;
const editorPath = `${inputControlsPath},il-editor`;

const loginPath = "il-app,il-login";

const chatName = '[data-cy="chat-name"]';
const conversationList = "il-conversation-list";
const editor = "#editor";
const chat = "il-chat";
const conversation = "il-conversation";
const activeConversation = "il-conversation.active";

Cypress.Commands.add("getLitElement", (elementPath) => {
  let elementNames = elementPath.includes(",")
    ? elementPath.split(",")
    : Array.of(elementPath);

  let ref = cy;

  for (let index = 0; index < elementNames.length; index++) {
    ref =
      index === 0
        ? ref.get(elementNames[index]).shadow()
        : ref.find(elementNames[index]).shadow();

    if (elementNames[index] === conversationList) ref.wait(4000);
  }

  return ref;
});

Cypress.Commands.add("litElementExist", (elementPath) => {
  let elementNames = elementPath.includes(",")
    ? elementPath.split(",")
    : Array.of(elementPath);

  let elementName = elementNames.pop();

  if (elementNames.length > 0) {
    let ref = cy.getLitElement(elementNames.toString());

    return ref.find(elementName).should("exist");
  } else {
    return cy.get(elementName).should("exist");
  }
});

Cypress.Commands.add("login", (user) => {
  cy.session(
    user,
    () => {
      const baseUrl = "http://localhost:8081";
      cy.visit(baseUrl, { failOnStatusCode: false });

      cy.getLitElement(`${loginPath},il-input-field#username`)
        .find("input")
        .type(user.user, { force: true });

      cy.getLitElement(`${loginPath},il-input-password#password`)
        .find("input")
        .type(user.password, { force: true });

      cy.getLitElement(`${loginPath},il-button-text`).find("button").click();
    },
    {
      validate: () => {},
    }
  );
});

Cypress.Commands.add("getEditor", () => {
  return cy.getLitElement(editorPath).find(editor);
});

Cypress.Commands.add(
  "countElements",
  (elementParentPath, elementToFind, number) => {
    cy.getLitElement(elementParentPath)
      .find(elementToFind)
      .should("have.length", number);
  }
);

Cypress.Commands.add("sendTestMessages", (number) => {
  for (let i = 0; i < number; i++)
    cy.getLitElement(editorPath)
      .find("#editor")
      .type(`test${i + 1}{enter}`);
});

Cypress.Commands.add("openChat", (name) => {
  cy.getLitElement(conversationPath)
    .find(".chat-name")
    .each((element, index) => {
      cy.wrap(element)
        .invoke("text")
        .then((txt) => {
          if (txt.trim() === name) {
            cy.getLitElement(conversationPath)
              .find(".chat-name")
              .eq(index)
              .click({ force: true });
          }
        });
    });
});

// Commands for conversation selection

Cypress.Commands.add("getConversationByIndex", (index) => {
  return cy.getLitElement(conversationListPath).find(conversation).eq(index);
});

Cypress.Commands.add("getOpenedConversation", () => {
  return cy.getLitElement(conversationListPath).find(activeConversation);
});

Cypress.Commands.add("getConversationName", (index) => {
  cy.getConversationByIndex(index).shadow().find(chatName).invoke("text");
});

Cypress.Commands.add("openChatByClick", (index) => {
  cy.getConversationByIndex(index)
    .shadow()
    .find(chatName)
    .click({ force: true });
});

Cypress.Commands.add("openChatWithArrows", (arrowsNumber) => {
  const inputText = Cypress._.repeat("{downArrow}", arrowsNumber);

  cy.getLitElement(sidebarInputPath)
    .find("input")
    .type(inputText + "{enter}", {
      force: true,
      parseSpecialCharSequences: true,
    });
});

Cypress.Commands.add("checkOpenedConversationName", (text) => {
  cy.getOpenedConversation().shadow().find(chatName).should("have.text", text);
});

// ------------------------------------

Cypress.Commands.add("hoverOnTheLast", () => {
  cy.getLitElement(messagePath)
    .last()
    .find(".message-body")
    .trigger("mouseover", { force: true });
});

Cypress.Commands.add("clickOnTheLastOptionsMenu", () => {
  cy.getLitElement(iconButtonPath)
    .last()
    .find(".icon-button")
    .click({ force: true });
});

/**
 * IMPORTANT NOTE: do NOT use this function to click on a button that copies text.
 * This because sometimes it will throw a "Document is not focused" exception, causing the test to fail.
 * To avoid this problem use the function getOptionButton, then focus it and then call realClick function.
 * Source: https://github.com/cypress-io/cypress/issues/18198#issuecomment-1003756021
 */
Cypress.Commands.add("clickOptionButton", (option) => {
  cy.getOptionButton(option).click({ force: true });
});

Cypress.Commands.add("getOptionButton", (option) => {
  return cy
    .getLitElement(`${messageMenuPopoverPath}, il-message-options`)
    .last()
    .find("il-message-button-option")
    .shadow()
    .find("div")
    .filter(`:contains("${option}")`);
});

Cypress.Commands.add("clickScrollToBottomButton", () => {
  cy.getLitElement(chatPath).find("il-button-icon").click({ force: true });
});
