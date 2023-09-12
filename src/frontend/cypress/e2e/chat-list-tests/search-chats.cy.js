import { Paths } from "../../support/paths-enum";

const searchButtonIconPath = `${Paths.sidebarInputSearchPath},il-button-icon`;

const conversation = "il-conversation";

describe("search spec", () => {
  it("icon is magnifying glass", () => {
    cy.getLitElement(searchButtonIconPath)
      .find("il-icon[name*=mdiMagnify]")
      .should("exist");
  });

  it("icon remains magnifying glass on click on input", () => {
    cy.getLitElement(Paths.sidebarInputSearchPath)
      .find("input")
      .click({ force: true });

    cy.getLitElement(searchButtonIconPath)
      .find("il-icon[name*=mdiMagnify]")
      .should("exist");
  });

  it("icon becomes cross on typing", () => {
    cy.getLitElement(Paths.sidebarInputSearchPath)
      .find("input")
      .type("test", { force: true });

    cy.getLitElement(searchButtonIconPath)
      .find("il-icon[name*=mdiClose]")
      .should("exist");
  });

  it("filters all", () => {
    cy.getLitElement(Paths.sidebarInputSearchPath)
      .find("input")
      .type("test", { force: true });

    cy.countElements(Paths.conversationListPath, conversation, 0);
  });

  it("search general", () => {
    cy.getLitElement(Paths.sidebarInputSearchPath)
      .find("input")
      .type("general", { force: true });

    cy.countElements(Paths.conversationListPath, conversation, 1);
  });

  it("search da", () => {
    cy.getLitElement(Paths.sidebarInputSearchPath)
      .find("input")
      .type("da", { force: true });

    cy.countElements(Paths.conversationListPath, conversation, 3);
  });

  it("clean search", () => {
    cy.getLitElement(Paths.sidebarInputSearchPath)
      .find("input")
      .type("test", { force: true });

    cy.getLitElement(Paths.sidebarInputSearchPath)
      .find("il-button-icon")
      .click({ force: true });

    cy.getLitElement(Paths.sidebarInputSearchPath)
      .find("input")
      .should("have.value", "");
  });

  it("input clears after chat is selected with click", () => {
    cy.getLitElement(Paths.sidebarInputSearchPath)
      .find("input")
      .type("da", { force: true });

    cy.getLitElement(Paths.conversationListPath)
      .find(conversation)
      .last()
      .shadow()
      .find(".chat-box")
      .click({ force: true });

    cy.getLitElement(Paths.sidebarInputSearchPath)
      .find("input")
      .should("have.value", "");
  });

  it("input clears after chat is selected with arrows", () => {
    cy.getLitElement(Paths.sidebarInputSearchPath).find("input").type("d", {
      force: true,
    });

    cy.getLitElement(Paths.sidebarInputSearchPath)
      .find("input")
      .type("{downArrow}", {
        force: true,
      });

    cy.getLitElement(Paths.sidebarInputSearchPath)
      .find("input")
      .type("{enter}", {
        force: true,
      });

    cy.getLitElement(Paths.sidebarInputSearchPath)
      .find("input")
      .should("have.value", "");
  });

  it('"Nessun risultato" appears in "Conversazioni" when there are no results', () => {
    cy.getLitElement(Paths.sidebarInputSearchPath)
      .find("input")
      .type("abc123", { force: true });

    cy.getLitElement(Paths.conversationListPath)
      .find("div")
      .contains("Conversazioni")
      .parent()
      .find('[data-cy="no-result"]')
      .should("exist");
  });

  it('"Nessun risultato" appears in "Nuove Conversazioni" when there are no results', () => {
    cy.getLitElement(Paths.sidebarInputSearchPath)
      .find("input")
      .type("abc123", { force: true });

    cy.getLitElement(Paths.conversationListPath)
      .find("div")
      .contains("Nuove conversazioni")
      .parent()
      .find('[data-cy="no-result"]')
      .should("exist");
  });
});

beforeEach(() => {
  cy.login({ user: "user1", password: "password1" });
});

afterEach(() => {
  Cypress.session.clearAllSavedSessions();
});
