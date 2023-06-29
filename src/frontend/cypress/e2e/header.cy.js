beforeEach(() => {
  cy.login({ user: "user1", password: "password1" });
});

describe("header component spec", () => {
  it("header component exists after login", () => {
    cy.litElementExist("il-app,il-chat,il-chat-header");
  });

  it("profileContainers exist in the il-chat header component", () => {
    cy.getLitElement("il-app,il-chat,il-chat-header")
      .find(".profileContainer")
      .should("exist");
  });

  it("asserting that only your profileContainer exists", () => {
    // asserting user profile container exist
    cy.getLitElement("il-app,il-chat , il-chat-header")
      .find("il-avatar[name='Mario Rossi']")
      .should("exist");

    // asserting conversation profile container doesn't exist
    cy.getLitElement("il-app,il-chat , il-chat-header")
      .find("il-avatar:not([name='Mario Rossi'])")
      .should("not.exist");

    // asserting user profile container has the correct description
    cy.getLitElement("il-app,il-chat , il-chat-header")
      .find(".profileContainer")
      .last()
      .should("include.text", "Mario Rossi");
  });

  it("asserting that your avatar displays the correct initials", () => {
    cy.getLitElement("il-app,il-chat,il-chat-header, il-avatar")
      .find("#avatar-default")
      .should("include.text", "MR");
  });

  it("get the correct avatar when you open a chat", () => {
    cy.getLitElement(
      "il-app,il-chat, il-sidebar, il-conversation-list, il-conversation"
    )
      .find(".chat-name")
      .as("conversation")
      .each((el, index) => {
        cy.get("@conversation").eq(index).click({ force: true });

        cy.getLitElement("il-app, il-chat, il-chat-header")
          .find("il-avatar")
          .should("have.length", 2);

        cy.wrap(el)
          .invoke("text")
          .then((text) => {
            cy.getLitElement("il-app, il-chat, il-chat-header")
              .find(".profileContainer")
              .should("include.text", text);
          });
      });
  });

  it("asserting that the avatar of a contact contains the correct initials ", () => {
    cy.getLitElement(
      "il-app,il-chat, il-sidebar, il-conversation-list, il-conversation"
    )
      .find(".chat-name")
      .as("conversation")
      .each((el, index) => {
        cy.get("@conversation").eq(index).click({ force: true });

        cy.getLitElement("il-app, il-chat, il-chat-header")
          .find("il-avatar")
          .should("have.length", 2);

        cy.wrap(el)
          .invoke("text")
          .then((text) => {
            const initials = text
              .split(" ")
              .map((t) => t.charAt(0))
              .join("")
              .toUpperCase();

            cy.getLitElement("il-app, il-chat, il-chat-header, il-avatar")
              .first()
              .find("#avatar-default")
              .should("include.text", initials);
          });
      });
  });
});

afterEach(() => {
  Cypress.session.clearAllSavedSessions();
});
