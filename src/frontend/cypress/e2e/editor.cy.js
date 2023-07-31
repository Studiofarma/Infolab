const chatPath = "il-app,il-chat";
const inputControlsPath = `${chatPath},il-input-controls`;
const editorPath = `${inputControlsPath},il-editor`;
const buttonIconPath = `${inputControlsPath},il-insertion-bar,il-button-icon`;

function getEditor() {
  return cy.getLitElement(editorPath).find("#editor");
}

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
    const editor = getEditor();

    editor.click({ force: true });

    editor.type("ABC");

    getEditor().then(($div) => {
      expect($div.text()).equal("ABC");
    });

    editor.type("{backspace}{backspace}DE");

    getEditor().then(($div) => {
      expect($div.text()).equal("ADE");
    });
  });

  it("Editor empty after enter pressed", () => {
    const editor = getEditor();

    editor.click({ force: true });

    editor.type("Test12345{enter}");

    editor.should("have.value", "");
  });

  it("Editor empty after send button pressed", () => {
    const editor = getEditor();

    editor.click({ force: true });

    editor.type("Test67890");

    cy.getLitElement(buttonIconPath)
      .find(".icon-button")
      .last()
      .click({ force: true });

    editor.should("have.value", "");
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

    getEditor().invoke("text").should("be.equal", "😀");
  });

  it("Editor formatting buttons works", () => {
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

    const editor = getEditor();

    editor.type("bold");

    editor.find("b").should("exist");
  });
});

afterEach(() => {
  Cypress.session.clearAllSavedSessions();
});
