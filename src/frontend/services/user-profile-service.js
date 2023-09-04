import { HttpService } from "./http-service";

export class UserProfileService {
  static async setUserDescription(newDescription) {
    await HttpService.httpPost(
      `/api/profile/changedesc?newDesc=${newDescription}`
    );
  }
}
