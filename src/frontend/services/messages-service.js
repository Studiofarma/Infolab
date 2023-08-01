import { MessageDto } from "../models/message-dto";
import { HttpService } from "./http-service";

export class MessagesService {
  static async getMessagesByRoomName(roomName) {
    let messages = await HttpService.httpGet(`/api/messages/${roomName}`);

    return messages.data.map((message) => {
      return new MessageDto(message);
    });
  }
}
