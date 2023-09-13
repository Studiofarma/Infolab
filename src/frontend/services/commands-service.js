import { HttpService } from "./http-service";
import { StorageService } from "./storage-service";

export class CommandsService {
  static async setMessagesAsRead(listOfMessages) {
    await HttpService.httpPost("/api/commands/lastread", listOfMessages);
  }

  static async setAllMessagesAsRead() {
    await HttpService.httpPostNoData(
      `/api/commands/readall?roomName=${StorageService.getItemByKey(
        StorageService.Keys.lastConversationName
      )}`
    );
  }
}
