const HEADER_PATH = "il-app,il-chat,il-chat-header";
const AVATAR_PATH = "il-app,il-chat,il-chat-header, il-avatar";
const CONVERSATION_PATH =
  "il-app,il-chat, il-conversation-list, il-conversation";

beforeEach(() => {
  cy.login({ user: "user1", password: "password1" });
});

describe("header component spec", () => {
  it("header component exists after login", () => {
    cy.litElementExist(HEADER_PATH);
  });

  it("profileContainers exist in the il-chat header component", () => {
    cy.getLitElement(HEADER_PATH).find(".profileContainer").should("exist");
  });

  it("asserting that only your profileContainer exists", () => {
    // asserting user profile container exist
    cy.getLitElement(HEADER_PATH)
      .find("il-avatar[name='Mario Rossi']")
      .should("exist");

    // asserting conversation profile container doesn't exist
    cy.getLitElement(HEADER_PATH)
      .find("il-avatar:not([name='Mario Rossi'])")
      .should("not.exist");

    // asserting user profile container has the correct description
    cy.getLitElement(HEADER_PATH)
      .find(".profileContainer")
      .last()
      .should("include.text", "Mario Rossi");
  });

  it("asserting that your avatar displays the correct initials", () => {
    cy.getLitElement(AVATAR_PATH)
      .find("#avatar-default")
      .should("include.text", "MR");
  });

  it("get the correct avatar when you open a chat", () => {
    cy.getLitElement(CONVERSATION_PATH)
      .find(".chat-name")
      .as("conversation")
      .each((el, index) => {
        cy.get("@conversation").eq(index).click({ force: true });

        cy.getLitElement(HEADER_PATH)
          .find("il-avatar")
          .should("have.length", 2);

        cy.wrap(el)
          .invoke("text")
          .then((text) => {
            cy.getLitElement(HEADER_PATH)
              .find(".profileContainer")
              .should("include.text", text);
          });
      });
  });

  it("asserting that the avatar of a contact contains the correct initials ", () => {
    cy.getLitElement(CONVERSATION_PATH)
      .find(".chat-name")
      .as("conversation")
      .each((el, index) => {
        cy.get("@conversation").eq(index).click({ force: true });

        cy.getLitElement(HEADER_PATH)
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

            cy.getLitElement(AVATAR_PATH)
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
