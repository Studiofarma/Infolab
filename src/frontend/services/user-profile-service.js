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

  static async setUserAvatar(imageLocalUrl) {
    const response = await fetch(imageLocalUrl);
    const blob = await response.blob();

    await HttpService.httpPost("/api/profile/changeavatar", blob);
  }
}
