function getTextarea() {
  return cy
    .getLitElement("il-app,il-chat,il-input-controls,il-editor")
    .find("textarea");
}

beforeEach(() => {
  cy.login({ user: "user1", password: "password1" });

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

  it("Editor types", () => {
    const textarea = getTextarea();

    textarea.type("ABC");

    textarea.should("have.value", "ABC");

    textarea.type("{backspace}{backspace}DE");

    textarea.should("have.value", "ADE");
  });

  it("Editor empty after enter pressed", () => {
    const textarea = getTextarea();

    textarea.type("Test12345{enter}");

    textarea.should("have.value", "");
  });

  it("Editor empty after send button pressed", () => {
    const textarea = getTextarea();

    textarea.type("Test67890");

    cy.getLitElement(
      "il-app,il-chat,il-input-controls,il-insertion-bar,il-button-icon"
    )
      .find(".icon-button")
      .last()
      .click({ force: true });

    textarea.should("have.value", "");
  });

  // it("Markdown shortcuts works", () => {
  //   const textarea = getTextarea();

  //   const markdowns = [
  //     { key: "b", result: "****" },
  //     { key: "s", result: "~~~~" },
  //     { key: "i", result: "**" },
  //     { key: "l", result: "[](insert link)" },
  //   ];

  //   let result = "";

  //   markdowns.forEach((markdown) => {
  //     textarea.type(`{alt+${markdown.key}}`);

  //     result += markdown.result;

  //     textarea.should("have.value", result);
  //   });
  // });

  it("Emoji works", () => {
    cy.getLitElement(
      "il-app,il-chat,il-input-controls,il-insertion-bar,il-button-icon"
    )
      .find(".icon-button")
      .eq(0)
      .click({ force: true });

    cy.getLitElement(
      "il-app,il-chat,il-input-controls,il-emoji-picker,emoji-picker"
    )
      .find(".tabpanel")
      .find(".emoji-menu")
      .find("button")
      .first()
      .click({ force: true });

    const textarea = getTextarea();

    textarea.should("have.value", "😀");
  });

  // it("Editor formatting buttons works", () => {
  //   cy.getLitElement(
  //     "il-app,il-chat,il-input-controls,il-insertion-bar,il-button-icon"
  //   )
  //     .find(".icon-button")
  //     .eq(1)
  //     .click({ force: true });

  //   cy.getLitElement(
  //     "il-app,il-chat,il-input-controls,il-insertion-bar,il-editor-formatting-buttons,il-formatting-button"
  //   )
  //     .find(".icon-button")
  //     .eq(0)
  //     .click({ force: true });

  //   getTextarea().should("have.value", "****");
  // });
});

afterEach(() => {
  Cypress.session.clearAllSavedSessions();
});
