describe("header component spec", () => {


  it("header component exists after login", () => {
    cy.login({ user: "user1", password: "password1"});

    cy.litElementExist("il-app,il-chat,il-chat-header");
  });


  it("profileContainers exist in the il-chat header component", () => {
    cy.login({ user: "user1", password: "password1" });

    cy.getLitElement("il-app,il-chat,il-chat-header")
      .find(".profileContainer")
      .should("exist");
  });

  it("check if only your profileContainer exists", () => {
    cy.login({ user: "user1", password: "password1" });

    cy.getLitElement("il-app,il-chat,il-chat-header")
      .find(".profileContainer")
      .should("have.length", 1)
      .and("include.text", "user1");
  });


  it("check if your avatar displays the correct initials", () => {
    cy.login({ user: "user1", password: "password1" });

    cy.getLitElement("il-app,il-chat,il-chat-header, il-avatar").find("#avatar-default").should("include.text", "U")

  });

  it("get the correct avatar when you open a chat", () => {

    cy.login({ user: "user1", password: "password1" });

    cy.getLitElement("il-app,il-chat, il-sidebar, il-conversation-list").find("il-conversation").each($el => {

      $el.shadow().find(".chat-name").click()

    })




  })
 


});

afterEach(() => {
  Cypress.session.clearAllSavedSessions();
});
