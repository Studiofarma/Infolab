import { HttpService } from "./http-service";

export class MessagesService {
  static async getMessagesById(roomName) {
    return HttpService.httpGet(`/api/messages/${roomName}`);
  }
}
