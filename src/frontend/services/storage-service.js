import { CookieService } from "./cookie-service";

export class StorageService {
  static Keys = {
    username: "username",
    password: "password",
    csrfToken: "csrf-token",

    lastConversationName: "last-conversation-name",
    selectedRoom: "selected-room",

    users: "users",
    loggedUser: "logged-user",

    theme: "theme",
  };

  /**
   * @param {StorageService.Keys} key
   */
  static getItemByKey(key) {
    if (key.includes("message:")) {
      console.log();
    }
    if (StorageService.#isUsernameOrPassword(key)) {
      return CookieService.getCookieByKey(key);
    } else {
      const sessionJson = sessionStorage.getItem(key);
      const sessionResult = sessionJson ? JSON.parse(sessionJson) : sessionJson;
      if (!sessionResult) {
        const localJson = localStorage.getItem(key);
        return localJson ? JSON.parse(localJson) : localJson;
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

  static deleteItemByKeyFromPermanent(key) {
    if (StorageService.#isUsernameOrPassword(key)) {
      CookieService.setCookieByKey(key, "");
    } else {
      localStorage.removeItem(key);
    }
  }

  /**
   * @param {String} roomName
   */
  static getStoredMessageForRoom(roomName) {
    const key = StorageService.#generateKeyFromRoomname(roomName);
    return StorageService.getItemByKey(key);
  }

  /**
   * @param {String} roomName
   * @param {String} message
   */
  static storeCurrentMessageForRoom(roomName, message) {
    const key = StorageService.#generateKeyFromRoomname(roomName);
    StorageService.setItemByKeyPermanent(key, message);
  }

  /**
   * @param {String} roomName
   */
  static deleteStoredMessageForRoom(roomName) {
    const key = StorageService.#generateKeyFromRoomname(roomName);
    StorageService.deleteItemByKeyFromPermanent(key);
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

  /**
   * @param {String} roomName
   * @returns generated key as string
   */
  static #generateKeyFromRoomname(roomName) {
    return `message:${roomName}`;
  }
}
