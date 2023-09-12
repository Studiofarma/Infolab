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

  static async getLoginWithToken(jwt) {
    return HttpService.httpGetWithHeadersAndJwt(
      "/csrf",
      {
        "X-Requested-With": "XMLHttpRequest",
      },
      jwt
    );
  }
}
