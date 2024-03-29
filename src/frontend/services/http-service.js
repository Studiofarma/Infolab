import { CommandsService } from "./commands-service";
import { StorageService } from "./storage-service";

const axios = require("axios").default;

export class HttpService {
  static async httpGet(url) {
    const { username, password } = HttpService.#getCredentials();

    return HttpService.httpGetWithHeadersAndCredentials(
      url,
      {},
      username,
      password
    );
  }

  /**
   * @param {Object} headers should be an object containing all the headers. It must not be undefined or null.
   */
  static async httpGetWithHeaders(url, headers) {
    const { username, password } = HttpService.#getCredentials();

    return HttpService.httpGetWithHeadersAndCredentials(
      url,
      headers,
      username,
      password
    );
  }

  /**
   * @param {Object} headers should be an object containing all the headers. It must not be undefined or null.
   */
  static async httpGetWithHeadersAndCredentials(
    url,
    headers,
    username,
    password
  ) {
    const config = { url: url, method: "get", headers: headers };

    if (CommandsService.isDevOrTest()) {
      config.auth = { username: username, password: password };
    }

    return axios(config);
  }

  /**
   *
   * @param {Object} data must be a standard javascript object. It will be serialized to json automatically.
   * @returns
   */
  static async httpPost(url, data) {
    const { username, password, csrfToken } = HttpService.#getCredentials();

    let config = {
      url: url,
      method: "post",
      headers: {
        "X-CSRF-TOKEN": csrfToken,
        "Content-Type": "application/json",
      },
    };

    if (data) {
      config = {
        ...config,
        data: data,
      };
    }

    if (CommandsService.isDevOrTest()) {
      config.auth = {
        username: username,
        password: password,
      };
    }

    return axios(config);
  }

  static async httpPostNoData(url) {
    return HttpService.httpPost(url, null);
  }

  /**
   * @returns object with username, password and csrfToken fields
   */
  static #getCredentials() {
    const username = StorageService.getItemByKey(StorageService.Keys.username);
    const password = StorageService.getItemByKey(StorageService.Keys.password);
    const csrfToken = StorageService.getItemByKey(
      StorageService.Keys.csrfToken
    );
    return { username: username, password: password, csrfToken: csrfToken };
  }
}
