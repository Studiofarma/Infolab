import { HttpService } from "./http-service";

export class CommandsService {
  static async setMessagesAsRead(listOfMessages) {
    await HttpService.httpPost("/api/commands/lastread", listOfMessages);
  }
}
