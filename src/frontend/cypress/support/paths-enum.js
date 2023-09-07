export const Paths = {};

Paths.chatPath = "il-app,il-chat";
Paths.conversationListPath = `${Paths.chatPath},il-conversation-list`;
Paths.sidebarInputSearchPath = `${Paths.conversationListPath},il-input-search, il-input-with-icon`;
Paths.inputControlsPath = `${Paths.chatPath},il-input-controls`;
Paths.editorPath = `${Paths.inputControlsPath},il-editor`;
Paths.conversationInConversationListPath = `${Paths.conversationListPath},il-conversation`;
Paths.messagesListPath = `${Paths.chatPath},il-messages-list`;
Paths.messagePath = `${Paths.messagesListPath}, il-message`;
Paths.messageMenuPopoverPath = `${Paths.messagePath}, il-message-menu-popover`;
Paths.messageOptions = `${Paths.messageMenuPopoverPath}, il-message-options`;
Paths.popoverIconButtonPath = `${Paths.messageMenuPopoverPath}, il-button-icon`;
