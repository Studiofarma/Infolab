const chatPath = "il-app,il-chat";
const inputControlsPath = `${chatPath},il-input-controls`;
const editorPath = `${inputControlsPath},il-editor`;
const buttonIconPath = `${inputControlsPath},il-insertion-bar,il-button-icon`;

beforeEach(() => {
  cy.login({ user: "user1", password: "password1" });

  cy.getLitElement(`${chatPath},il-conversation-list,il-conversation`)
    .find(".chat-box")
    .first()
    .click({ force: true });
});

describe("Editor spec", () => {
  it("Editor exists", () => {
    cy.litElementExist(editorPath);
  });

  it("Editor types", () => {
    cy.getEditor().click({ force: true });

    cy.getEditor().type("ABC");

    cy.getEditor().then(($div) => {
      expect($div.text()).equal("ABC");
    });

    cy.getEditor().type("{backspace}{backspace}DE");

    cy.getEditor().then(($div) => {
      expect($div.text()).equal("ADE");
    });
  });

  it("Editor empty after enter pressed", () => {
    cy.getEditor().click({ force: true });

    cy.getEditor().type("Test12345{enter}");

    cy.getEditor().should("have.value", "");
  });

  it("Editor empty after send button pressed", () => {
    cy.getEditor().click({ force: true });

    cy.getEditor().type("Test67890");

    cy.getLitElement(buttonIconPath)
      .find(".icon-button")
      .last()
      .click({ force: true });

    cy.getEditor().should("have.value", "");
  });

  it("Emoji works", () => {
    cy.getLitElement(buttonIconPath)
      .find(".icon-button")
      .eq(0)
      .click({ force: true });

    cy.getLitElement(`${inputControlsPath},il-emoji-picker,emoji-picker`)
      .find(".tabpanel")
      .find(".emoji-menu")
      .find("button")
      .first()
      .click({ force: true });

    cy.getEditor().invoke("text").should("be.equal", "😀");
  });

  it("Editor formatting buttons work", () => {
    cy.getLitElement(buttonIconPath)
      .find(".icon-button")
      .eq(1)
      .click({ force: true });

    cy.getLitElement(
      "il-app,il-chat,il-input-controls,il-insertion-bar,il-editor-formatting-buttons,il-button-icon"
    )
      .find(".icon-button")
      .eq(0)
      .click({ force: true });

    cy.getEditor().type("bold");

    cy.getEditor().find("b").should("exist");
  });

  it("Editor formatting buttons work with highlighted text", () => {
    cy.getLitElement(buttonIconPath)
      .find(".icon-button")
      .eq(1)
      .click({ force: true });

    cy.getEditor().click({ force: true });

    cy.getEditor().type("Italic test");

    cy.getEditor().realPress(["Shift", "ArrowLeft", "ArrowLeft", "ArrowLeft"]); // This should highlight: est

    cy.getLitElement(
      "il-app,il-chat,il-input-controls,il-insertion-bar,il-editor-formatting-buttons,il-button-icon"
    )
      .find(".icon-button")
      .eq(1)
      .click({ force: true });

    cy.getEditor().find("i").should("exist");

    cy.getEditor().find("i").should("have.text", "est");
  });
});

afterEach(() => {
  Cypress.session.clearAllSavedSessions();
});
