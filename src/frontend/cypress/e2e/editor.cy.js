beforeEach(() => {
  cy.login({ user: "user1", password: "password1" });

  // cy.setCookie("last-chat", "user1-user2");

  cy.getLitElement(
    "il-app,il-chat,il-sidebar,il-conversation-list,il-conversation"
  )
    .find(".chat-box")
    .first()
    .click({ force: true });
});

describe("Editor spec", () => {
  it("Editor exists", () => {
    cy.litElementExist("il-app,il-chat,il-input-controls,il-editor");
  });

  it("Editor sends messages", () => {
    const textarea = cy
      .getLitElement("il-app,il-chat,il-input-controls,il-editor")
      .find("textarea");
    textarea.type("Test12345{enter}");
    textarea.should("have.value", "");
  });

  it("Editor sends \\n correctly", () => {
    const textarea = cy
      .getLitElement("il-app,il-chat,il-input-controls,il-editor")
      .find("textarea");
    textarea.type(
      "Linea 1{shift+enter}Linea 2{shift+enter}### Linea TITOLO{shift+enter}Linea 3{shift+enter}* UL 1{shift+enter}UL 2{shift+enter}{backspace}{backspace}Linea di spazio{shift+enter}1. OL 1{shift+enter}OL 2{enter}"
    );
    textarea.should("have.value", "");
  });
});

afterEach(() => {
  Cypress.session.clearAllSavedSessions();
});
