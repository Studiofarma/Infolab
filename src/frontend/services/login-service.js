import { HttpService } from "./http-service";

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
