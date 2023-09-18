import { CookieDto } from "../models/cookie-dto";

export class CookieService {
  static Keys = {
    username: "username",
    password: "password",
  };

  static getCookieByKey(name) {
    const result = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${name}=`))
      ?.split("=")[1];

    return result;
  }

  static setCookieByKey(key, value) {
    let expires = new Date(Date.now());
    expires.setDate(expires.getDate() + 1);
    document.cookie = `${key}=${value}; expires=${expires}; `;
  }
}
