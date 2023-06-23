describe("Login spec", () => {
  it("login fail", () => {
    cy.login({ user: "a", password: "a" });

    cy.getCookie("token", { domain: "localhost" }).should("not.exist");
  });

  it("login works", () => {
    cy.login({ user: "user1", password: "password1" });

    cy.litElementExist("il-app,il-chat");

    cy.getCookie("token", { domain: "localhost" }).should("exist");
  });
});

afterEach(() => {
  Cypress.session.clearAllSavedSessions();
});
