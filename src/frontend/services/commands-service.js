import { CookieService } from "./cookie-service";
import { HttpService } from "./http-service";

export class CommandsService {
  static async setMessagesAsRead(listOfMessages) {
    await HttpService.httpPost("/api/commands/lastread", listOfMessages);
  }

  static async setAllMessagesAsRead() {
    let cookie = CookieService.getCookie();
    await HttpService.httpPostNoData(
      `/api/commands/readall?roomName=${cookie.lastChat}`
    );
  }
}
