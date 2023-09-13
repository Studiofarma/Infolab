import { CookieService } from "./cookie-service";

export class StorageService {
  static Keys = {
    username: "username",
    password: "password",
    lastConversationName: "last-conversation-name",

    csrfToken: "csrf-token",

    users: "users",
    loggedUser: "logged-user",

    theme: "theme",
  };

  /**
   * @param {StorageService.Keys} key
   */
  static getItemByKey(key) {
    if (StorageService.#isUsernameOrPassword(key)) {
      return CookieService.getCookieByKey(key);
    } else {
      const sessionResult = JSON.parse(sessionStorage.getItem(key));
      if (!sessionResult) {
        return JSON.parse(localStorage.getItem(key));
      }
      return sessionResult;
    }
  }

  /**
   * @param {StorageService.Keys} key
   * @param {Object} item must not be stringified.
   */
  static setItemByKeySession(key, item) {
    sessionStorage.setItem(key, JSON.stringify(item));
  }

  static setItemByKeyPermanent(key, item) {
    if (StorageService.#isUsernameOrPassword(key)) {
      CookieService.setCookieByKey(key, item);
    } else {
      localStorage.setItem(key, JSON.stringify(item));
    }
  }

  /**
   * @param {StorageService.Keys} key
   */
  static deleteItemByKeyFromSession(key) {
    sessionStorage.removeItem(key);
  }

  static deleteItemByKeyFromPremanent(key) {
    if (StorageService.#isUsernameOrPassword(key)) {
      CookieService.setCookieByKey(key, "");
    } else {
      localStorage.removeItem(key);
    }
  }

  /**
   * @param {StorageService.Keys} key
   */
  static #isUsernameOrPassword(key) {
    return (
      key === StorageService.Keys.username ||
      key === StorageService.Keys.password
    );
  }
}
