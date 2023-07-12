import { HttpService } from "./http-service";

export class OpenChatsService {
  static async getOpenChats() {
    return HttpService.httpGet("/api/rooms");
  }
}
