import { CookieService } from "./cookie-service";

export class StorageService {
  static Keys = {
    username: "username",
    password: "password",
    csrfHeader: "header",
    csrfToken: "token",
    lastConversationName: "last-chat",
  };

  /**
   * @param {StorageService.Keys} key
   */
  static getItemByKey(key) {
    return CookieService.getCookieByKey(key);
  }

  /**
   * @param {StorageService.Keys} key
   * @param {Object} item must not be stringified.
   */
  static setItemByKey(key, item) {
    CookieService.setCookieByKey(key, item);
  }
}
