import { Paths } from "../support/paths-enum";

const headerPath = `${Paths.chatPath},il-chat-header`;
const avatarPath = `${headerPath}, il-avatar`;

beforeEach(() => {
  cy.login({ user: "user1", password: "password1" });

  cy.wait(1000);
});

describe("header component spec", () => {
  it("header component exists after login", () => {
    cy.litElementExist(headerPath);
  });

  it("profileContainers exist in the il-chat header component", () => {
    cy.getLitElement(headerPath).find(".profileContainer").should("exist");
  });

  it("asserting that only your profileContainer exists", () => {
    // asserting user profile container exist
    cy.getLitElement(headerPath)
      .find("il-avatar[name='Mario Rossi']")
      .should("exist");

    // asserting conversation profile container doesn't exist
    cy.getLitElement(headerPath)
      .find("il-avatar:not([name='Mario Rossi'])")
      .should("not.exist");

    // asserting user profile container has the correct description
    cy.getLitElement(headerPath)
      .find(".profileContainer")
      .last()
      .should("include.text", "Mario Rossi");
  });

  it("asserting that your avatar displays the correct initials", () => {
    cy.getLitElement(avatarPath)
      .find("#avatar-default")
      .should("include.text", "MR");
  });

  it("get the correct avatar when you open a chat", () => {
    cy.getLitElement(Paths.conversationInConversationListPath)
      .find(".chat-name")
      .as("conversation")
      .each((el, index) => {
        cy.get("@conversation").eq(index).click({ force: true });

        cy.getLitElement(headerPath).find("il-avatar").should("have.length", 2);

        cy.wrap(el)
          .invoke("text")
          .then((text) => {
            cy.getLitElement(headerPath)
              .find(".profileContainer")
              .first()
              .invoke("text")
              .then((txt) => {
                cy.wrap({ value: txt.trim() })
                  .its("value")
                  .should("equal", text.trim());
              });
          });
      });
  });

  it("asserting that the avatar of a contact contains the correct initials ", () => {
    cy.getLitElement(Paths.conversationInConversationListPath)
      .find(".chat-name")
      .as("conversation")
      .each((el, index) => {
        cy.get("@conversation").eq(index).click({ force: true });

        cy.getLitElement(headerPath).find("il-avatar").should("have.length", 2);

        cy.wrap(el)
          .invoke("text")
          .then((text) => {
            const initials = text
              .trim()
              .split(" ")
              .map((t) => t.charAt(0))
              .join("")
              .toUpperCase();

            cy.getLitElement(avatarPath)
              .first()
              .find("#avatar-default")
              .invoke("text")
              .then((txt) => {
                cy.wrap({ value: txt.trim() })
                  .its("value")
                  .should("equal", initials);
              });
          });
      });
  });
});

afterEach(() => {
  Cypress.session.clearAllSavedSessions();
});
