import { Paths } from "../support/paths-enum";

describe("Login spec", () => {
  it("fail test", () => {
    throw new Error("test fails here");
  })

  it("login fail", () => {
    cy.login({ user: "a", password: "a" });

    cy.window()
      .its("sessionStorage")
      .invoke("getItem", "csrf-token")
      .should("not.exist");
  });

  it("login works", () => {
    cy.login({ user: "user1", password: "password1" });

    cy.litElementExist(Paths.chatPath);

    cy.window()
      .its("sessionStorage")
      .invoke("getItem", "csrf-token")
      .should("exist");
  });
});

afterEach(() => {
  Cypress.session.clearAllSavedSessions();
});
