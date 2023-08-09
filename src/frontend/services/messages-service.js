import { MessageDto } from "../models/message-dto";
import { HttpService } from "./http-service";

export class MessagesService {
  static pageSize = 20;

  static async getMessagesByRoomName(roomName) {
    let messages = await HttpService.httpGet(`/api/messages/${roomName}`);

    return messages.data.map((message) => {
      return new MessageDto(message);
    });
  }

  static async getNextByRoomName(roomName, before) {
    let link = `/api/messages/${roomName}?page[size]=${MessagesService.pageSize}`;

    let messages;

    if (before) {
      messages = await HttpService.httpGet(
        encodeURI(`${link}&page[before]=${before}`)
      );
    } else {
      messages = await HttpService.httpGet(encodeURI(link));
    }

    return messages.data.map((message) => {
      return new MessageDto(message);
    });
  }
}
