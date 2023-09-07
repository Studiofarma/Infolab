export const Paths = {};

Paths.chatPath = "il-app,il-chat";
Paths.conversationListPath = `${Paths.chatPath},il-conversation-list`;
Paths.sidebarInputSearchPath = `${Paths.conversationListPath},il-input-search, il-input-with-icon`;
Paths.inputControlsPath = `${Paths.chatPath},il-input-controls`;
Paths.editorPath = `${Paths.inputControlsPath},il-editor`;
