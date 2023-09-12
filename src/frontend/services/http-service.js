import { CookieService } from "./cookie-service";

const axios = require("axios").default;

export class HttpService {
  static async httpGet(url) {
    let cookie = CookieService.getCookie();

    return HttpService.httpGetWithHeadersAndCredentials(
      url,
      {},
      cookie.username,
      cookie.password
    );
  }

  /**
   * @param {Object} headers should be an object containing all the headers. It must not be undefined or null.
   */
  static async httpGetWithHeaders(url, headers) {
    let cookie = CookieService.getCookie();

    return HttpService.httpGetWithHeadersAndCredentials(
      url,
      headers,
      cookie.username,
      cookie.password
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
    return axios({
      url: url,
      method: "get",
      headers: headers,
      auth: {
        username: username,
        password: password,
      },
    });
  }

  /**
   *
   * @param {Object} data must be a standard javascript object. It will be serialized to json automatically.
   * @returns
   */
  static async httpPost(url, data) {
    let cookie = CookieService.getCookie();

    let config = {
      url: url,
      method: "post",
      headers: {
        "X-CSRF-TOKEN": cookie.token,
        "Content-Type": "application/json",
      },
      auth: {
        username: cookie.username,
        password: cookie.password,
      },
    };

    if (data) {
      config = {
        ...config,
        data: data,
      };
    }

    return axios(config);
  }

  static async httpPostNoData(url) {
    return HttpService.httpPost(url, null);
  }

  static async httpGetWithHeadersAndJwt(url, headers, jwt) {
    headers = { ...headers, Authorization: `Bearer ${jwt}` };

    return axios({
      url: url,
      method: "get",
      headers: headers,
    });
  }
}
