import { css } from "lit";

export const VariableNames = {
  text: css`var(--text)`,
  actionText: css`var(--actionText)`,
  scrollbar: css`var(--scrollbar)`,
  link: css`var(--link)`,
  boxShadowPrimary: css`var(--boxShadowPrimary)`,
  boxShadowSecondary: css`var(--boxShadowSecondary)`,

  backdrop: css`var(--backdrop)`,

  loginFieldBg: css`var(--loginFieldBg)`,
  loginBg: css`var(--loginBg)`,

  chatBackground: css`var(--chatBackground)`,

  textPrimary: css`var(--textPrimary)`,
  textSecondary: css`var(--textSecondary)`,

  snackbarBg: css`var(--snackbarBg)`,
  snackbarText: css`var(--snackbarText)`,
  error: css`var(--error)`,
  warning: css`var(--warning)`,
  info: css`var(--info)`,

  initialsText: css`var(--initialsText)`,
  statusBorder: css`var(--statusBorder)`,
  onlineStatus: css`var(--onlineStatus)`,
  offlineStatus: css`var(--offlineStatus)`,

  iconColor: css`var(--iconColor)`,

  buttonText: css`var(--buttonText)`,
  buttonBorder: css`var(--buttonBorder)`,
  buttonConfirmBg: css`var(--buttonConfirmBg)`,
  buttonUndoBg: css`var(--buttonUndoBg)`,

  inputText: css`var(--inputText)`,
  placeholder: css`var(--placeholder)`,

  inputBackgroud: css`var(--inputBackgroud)`,
  inputBorder: css`var(--inputBorder)`,
  inputFocusedBorder: css`var(--inputFocusedBorder)`,

  tooltipBg: css`var(--tooltipBg)`,
  tooltipText: css`var(--tooltipText)`,

  headerBg: css`var(--headerBg)`,
  headerColor: css`var(--headerColor)`,

  messageSenderBg: css`var(--messageSenderBg)`,
  messageSenderText: css`var(--messageSenderText)`,
  messageReceiverBg: css`var(--messageReceiverBg)`,
  messageReceiverText: css`var(--messageReceiverText)`,
  messageSenderNameText: css`var(--messageSenderNameText)`,
  deletedMessageText: css`var(--deletedMessageText)`,
  modifiedMessageText: css`var(--modifiedMessageText)`,
  timestampMessageText: css`var(--timestampMessageText)`,
  datetimeMessageBg: css`var(--datetimeMessageBg)`,
  datetimeMessageText: css`var(--datetimeMessageText)`,
  messageMenuBg: css`var(--messageMenuBg)`,
  messageMenuBgHover: css`var(--messageMenuBgHover)`,

  sidebarBg: css`var(--sidebarBg)`,
  sidebarSeparator: css`var(--sidebarSeparator)`,
  sidebarNoResults: css`var(--sidebarNoResults)`,
  conversationChatName: css`var(--conversationChatName)`,
  conversationLastMessageText: css`var(--conversationLastMessageText)`,
  conversationLastMessageLinkText: css`var(--conversationLastMessageLinkText)`,
  conversationLastMessageLinkTextHover: css`var(--conversationLastMessageLinkTextHover)`,
  conversationTimestapText: css`var(--conversationTimestapText)`,
  conversationUnreadMessageCounter: css`var(--conversationUnreadMessageCounter)`,
  conversationUnreadMessageText: css`var(--conversationUnreadMessageText)`,
  conversationHoverBg: css`var(--conversationHoverBg)`,
  conversationActiveBg: css`var(--conversationActiveBg)`,

  inputControlsBg: css`--inputControlsBg`,
  editorBg: css`var(--editorBg)`,
  editorInputBg: css`var(--editorInputBg)`,
};

export const ThemeColorsEnum = {
  light: {
    text: "#333",
    actionText: "#206cf7",
    scrollbar: "#206cf7",
    link: "#0000FF",
    boxShadowPrimary: "#b7b9bd",
    boxShadowSecondary: "#00000029",
    backdrop: "#00000037",

    loginFieldBg: "#e4e8ee",
    loginBg: "#083c72",

    chatBackground: "#eaecef",

    textPrimary: "#3d3f41",
    textSecondary: "#5c5e60",

    snackbarBg: "#fff",
    snackbarText: "#000",
    error: "#fe354b",
    warning: "#f7a635",
    info: "#206cf7",

    initialsText: "#fff",
    statusBorder: "#fff",
    onlineStatus: "#68c47e",
    offlineStatus: "#dbdde0",

    iconColor: "#206cf7",

    buttonText: "#fff",
    buttonBorder: "#616870",
    buttonConfirmBg: "#206cf7",
    buttonUndoBg: "#dc2042",

    inputText: "#000",
    placeholder: "#6f7174",

    inputBackgroud: "transparent",
    inputBorder: "#989a9d",
    inputFocusedBorder: "#206cf7",

    tooltipBg: "#206cf7",
    tooltipText: "#fff",

    headerBg: "#083c72",
    headerColor: "#fff",

    messageSenderBg: "#c5e1fe",
    messageSenderText: "#000",
    messageReceiverBg: "#fff",
    messageReceiverText: "#000s",
    messageSenderNameText: "#0000FF",
    deletedMessageText: "#1d1e20",
    modifiedMessageText: "#1d1e20",
    timestampMessageText: "#1d1e20",
    datetimeMessageBg: "#DDDDDD",
    datetimeMessageText: "#000",
    messageMenuBg: "#fff",
    messageMenuBgHover: "#dfd8d8",

    sidebarBg: "#f2f4f7",
    sidebarSeparator: "#1d1e20",
    sidebarNoResults: "#3d3f41",
    conversationChatName: "#000",
    conversationLastMessageText: "#3d3f41",
    conversationLastMessageLinkText: "#D3D3D3",
    conversationLastMessageLinkTextHover: "#fff",
    conversationTimestapText: "#3d3f41",
    conversationUnreadMessageCounter: "#0DA2FF",
    conversationUnreadMessageText: "#3AB3FF",
    conversationHoverBg: "#e1f0ff",
    conversationActiveBg: "#c5e1fe",

    inputControlsBg: "#f2f4f7",
    editorBg: "#eaecef",
    editorInputBg: "#fff",
  },

  dark: {},
};
