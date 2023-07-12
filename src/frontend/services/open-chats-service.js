import { HttpService } from "./http-service";

const axios = require("axios").default;

export class OpenChatsService {
  static async getOpenChats(username, password) {
    return HttpService.httpGet("/api/rooms");
  }
}
