const messagePath = "il-app, il-chat, il-messages-list, il-message";
const iconButtonPath =
  "il-app,il-chat, il-messages-list, il-message, il-message-menu-popover, il-button-icon";

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
      cy.visit(baseUrl);

      cy.getLitElement("il-app,il-login,il-input-field#username")
        .find("input")
        .type(user.user, { force: true });

      cy.getLitElement("il-app,il-login,il-input-password#password")
        .find("input")
        .type(user.password, { force: true });

      cy.getLitElement("il-app,il-login,il-button-text").find("button").click();
    },
    {
      validate: () => {},
    }
  );
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
    cy.getLitElement("il-app, il-chat, il-input-controls, il-editor")
      .find("textarea")
      .type(`test${i + 1}{enter}`);
});

Cypress.Commands.add("openChat", (name) => {
  cy.getLitElement(
    "il-app, il-chat, il-sidebar, il-conversation-list, il-conversation"
  )
    .find(".chat-name")
    .each((element, index) => {
      cy.wrap(element)
        .invoke("text")
        .then((txt) => {
          if (txt === name) {
            cy.getLitElement(
              "il-app, il-chat, il-sidebar, il-conversation-list, il-conversation"
            )
              .find(".chat-name")
              .eq(index)
              .click({ force: true });
          }
        });
    });
});

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

Cypress.Commands.add("clickOptionButton", (option) => {
  cy.getLitElement(
    "il-app, il-chat, il-messages-list, il-message, il-message-menu-popover, il-message-options"
  )
    .last()
    .find("message-button-option")
    .shadow()
    .find("div")
    .filter(`:contains("${option}")`)
    .click({ force: true });
});
