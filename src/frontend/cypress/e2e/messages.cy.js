beforeEach(() => {
  // login
  cy.login({ user: "user1", password: "password1" });

  // opening the general chat
  cy.openChat("Generale");
});

describe("messages spec", () => {
  it("asserting that the messages container exists ", () => {
    cy.litElementExist("il-app ,il-chat, il-messages-list");

    // sending some test messages in case they aren't present by default

    cy.sendTestMessages(2);

    cy.litElementExist("il-app, il-chat, il-messages-list, il-message");
  });

  it("asserting that messages contain the content and the timestamp)", () => {
    cy.litElementExist(
      "il-app, il-chat, il-messages-list, il-message, il-message-content"
    );

    cy.getLitElement(
      "il-app, il-chat, il-messages-list, il-message, il-message-content"
    )
      .first()
      .find(".message")
      .should("exist")
      .and("not.to.be.empty");

    cy.getLitElement(
      "il-app, il-chat, il-messages-list, il-message, il-message-content"
    )
      .first()
      .find(".message-timestamp")
      .should("exist")
      .and("not.to.be.empty");
  });

  it("asserting that in the general chat, the received messages contain the sender info", () => {
    cy.getLitElement(
      "il-app, il-chat, il-messages-list,il-message, il-message-content"
    )
      .find("main")
      .filter(":has(.receiver-name)")
      .first()
      .then((element) => {
        cy.wrap(element).find(".receiver-name").should("not.to.be.empty");
      });
  });

  it("asserting that the options menu icon will display when you hover on a message", () => {
    cy.getLitElement("il-app, il-chat, il-messages-list, il-message")
      .first()
      .find(".message-body")
      .trigger("mouseover", { force: true });

    cy.getLitElement(
      "il-app, il-chat, il-messages-list, il-message, il-message-menu-popover, il-button-icon"
    )
      .find(".icon-button")
      .should("be.visible");
  });

  it("asserting that the options menu displays his content after clicking on his icon", () => {
    cy.getLitElement("il-app, il-chat, il-messages-list, il-message")
      .first()
      .find(".message-body")
      .trigger("mouseover", { force: true });

    cy.getLitElement(
      "il-app, il-chat, il-messages-list, il-message, il-message-menu-popover, il-button-icon"
    )
      .first()
      .find(".icon-button")
      .click({ force: true });

    cy.getLitElement(
      "il-app ,il-chat, il-messages-list, il-message, il-message-menu-popover, il-message-options"
    )
      .find("div")
      .should("be.visible")
      .and("not.to.be.empty");
  });

  it("asserting that the button 'Inoltra' works", () => {
    cy.getLitElement("il-app, il-chat, il-messages-list, il-message")
      .first()
      .find(".message-body")
      .trigger("mouseover", { force: true });

    cy.getLitElement(
      "il-app, il-chat, il-messages-list, il-message, il-message-menu-popover, il-button-icon"
    )
      .first()
      .find(".icon-button")
      .click({ force: true });

    cy.getLitElement(
      "il-app ,il-chat, il-messages-list, il-message, il-message-menu-popover, il-message-options, message-button-option"
    )
      .eq(1)
      .find("div")
      .click({ force: true });

    cy.getLitElement(
      "il-app, il-chat, il-messages-list, il-message, il-message-content"
    )
      .first()
      .find(".message")
      .invoke("text")
      .then((txt) => {
        cy.getLitElement(
          "il-app ,il-chat, il-conversation-list, il-conversation"
        )
          .eq(2)
          .find(".chat-name")
          .invoke("text")
          .then((description) => {
            cy.getLitElement(
              "il-app ,il-chat, il-conversation-list, il-conversation"
            )
              .eq(2)
              .find(".chat-name")
              .click({ force: true });

            cy.getLitElement(
              "il-app, il-chat, il-sidebar, il-conversation-list, il-conversation"
            )
              .first()
              .find(".chat-name")
              .should("have.text", description);

            cy.getLitElement(
              "il-app, il-chat, il-messages-list, il-message, il-message-content"
            )
              .last()
              .find(".message")
              .should("have.text", txt);
          });
      });
  });

  it("asserting that the button 'Elimina' works", () => {
    cy.getLitElement("il-app, il-chat, il-messages-list, il-message")
      .first()
      .find(".message-body")
      .trigger("mouseover", { force: true });

    cy.getLitElement(
      "il-app, il-chat, il-messages-list, il-message, il-message-menu-popover, il-button-icon"
    )
      .first()
      .find(".icon-button")
      .click({ force: true });

    cy.getLitElement("il-app, il-chat, il-messages-list, il-message")
      .find(".message-body")
      .its("length")
      .then((length) => {
        cy.getLitElement(
          "il-app ,il-chat, il-messages-list, il-message, il-message-menu-popover, il-message-options"
        )
          .find("message-button-option")
          .last()
          .shadow()
          .find("div")
          .click({ force: true });

        cy.getLitElement("il-app, il-chat, il-messages-list, il-message")
          .find(".message-body")
          .should("have.length", length - 1);
      });
  });

  it("asserting that the button 'Scrivi in privato' works", () => {
    cy.getLitElement("il-app, il-chat, il-messages-list,il-message")
      .find(".message-body")
      .filter(":has(.receiver)")
      .first()
      .then((element) => {
        cy.wrap(element)
          .find("il-message-content")
          .shadow()
          .find(".receiver-name")
          .first()
          .invoke("text")
          .then((txt) => {
            // per il momento l'info del sender contiene la roomName, sarà poi da sistemare con la description
            const roomNameDescription = [
              { roomname: "user1", description: "Mario Rossi" },
              { roomname: "user2", description: "Fabrizio Bruno" },
              { roomname: "daniele", description: "Daniele" },
              { roomname: "davide", description: "Davide" },
              { roomname: "davide.giudici", description: "Davide Giudici" },
              { roomname: "lorenzo", description: "Lorenzo" },
              { roomname: "luca.minini", description: "Luca Minini" },
              { roomname: "mattia.pedersoli", description: "Mattia Pedersoli" },
              { roomname: "mirko", description: "Mirko" },
            ];

            let index = roomNameDescription.findIndex(
              (obj) => obj.roomname === txt.trim()
            );

            let description = roomNameDescription[index].description;

            cy.wrap(element)
              .find("il-message-menu-popover")
              .shadow()
              .find("il-button-icon")
              .shadow()
              .find(".icon-button")
              .click({ force: true });

            cy.wrap(element)
              .find("il-message-menu-popover")
              .shadow()
              .find("il-message-options")
              .shadow()
              .find("message-button-option")
              .eq(2)
              .shadow()
              .find("div")
              .click({ force: true });

            cy.getLitElement(
              "il-app, il-chat, il-sidebar, il-conversation-list"
            )
              .find("il-conversation")
              .filter(".active")
              .shadow()
              .find(".chat-name")
              .should("have.text", description);
          });
      });
  });
});

afterEach(() => {
  Cypress.session.clearAllSavedSessions();
});
