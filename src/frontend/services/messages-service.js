import { MessageDto } from "../models/message-dto";
import { HttpService } from "./http-service";

export class MessagesService {
  static async getMessagesByRoomName(roomName) {
    let messages = await HttpService.httpGet(`/api/messages/${roomName}`);

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
