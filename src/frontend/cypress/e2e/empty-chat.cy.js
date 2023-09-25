import { Paths } from "../support/paths-enum";

describe("Empty chat component spec", () => {
  it("empty chat exist after login", () => {
    cy.login({ user: "user1", password: "password1" });

    cy.litElementExist(`${Paths.chatPath},il-empty-chat`);
  });
});

afterEach(() => {
  Cypress.session.clearAllSavedSessions();
});
