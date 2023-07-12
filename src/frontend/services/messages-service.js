import { MessageDto } from "../models/message-dto";

const axios = require("axios").default;

export class MessagesService {
  static async getMessagesByRoomName(username, password, roomName) {
    let messages = await axios({
      url: `/api/messages/${roomName}`,
      method: "get",
      auth: {
        username: username,
        password: password,
      },
    });

    // #region Mock data
    // TODO: remove this region when data comes from BE
    messages.data.forEach((message) => {
      message.hasBeenEdited = false;
      message.hasBeenDeleted = false;
    });
    // #endregion

    return messages.data.map((message) => {
      return new MessageDto(message);
    });
  }
}
