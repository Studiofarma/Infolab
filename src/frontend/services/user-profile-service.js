import { HttpService } from "./http-service";

export class UserProfileService {
  static async setUserDescription(newDescription) {
    await HttpService.httpPost(
      `/api/profile/changedesc?newDesc=${newDescription}`
    );
  }

  static async setUserTheme(newTheme) {
    await HttpService.httpPost(
      `/api/profile/changetheme?newTheme=${newTheme.toUpperCase()}`
    );
  }
}
