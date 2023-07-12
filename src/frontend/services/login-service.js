import { HttpService } from "./http-service";

const axios = require("axios").default;

export class LoginService {
  static async getLogin(username, password) {
    return HttpService.httpGetWithHeadersAndCredentials(
      "/csrf",
      {
        "X-Requested-With": "XMLHttpRequest",
      },
      username,
      password
    );
  }
}
