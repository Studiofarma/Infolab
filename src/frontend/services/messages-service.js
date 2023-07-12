import { HttpService } from "./http-service";

const axios = require("axios").default;

export class MessagesService {
  static async getMessagesById(username, password, roomName) {
    return HttpService.httpGet(`/api/messages/${roomName}`);
  }
}
