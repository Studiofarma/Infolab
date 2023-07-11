export class CookieService {
  static Keys = {
    username: "username",
    password: "password",
    header: "header",
    token: "token",
    lastChat: "last-chat",
    lastDescription: "last-description",
  };

  static getCookieByKey(name) {
    const result = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${name}=`))
      ?.split("=")[1];

    return result;
  }
  static getCookie() {
    let isValid = true;
    const username = CookieService.getCookieByKey(CookieService.Keys.username);
    if (!username) isValid = false;

    const password = CookieService.getCookieByKey(CookieService.Keys.password);
    if (!password) isValid = false;

    const header = CookieService.getCookieByKey(CookieService.Keys.header);
    if (!header) isValid = false;

    const token = CookieService.getCookieByKey(CookieService.Keys.token);
    if (!token) isValid = false;

    const lastChat = CookieService.getCookieByKey(CookieService.Keys.lastChat);

    const lastDescription = CookieService.getCookieByKey(
      CookieService.Keys.lastDescription
    );

    let cookie = {
      username: username,
      password: password,
      header: header,
      token: token,
      lastChat: lastChat,
      lastDescription: lastDescription,
      isValid: isValid,
    };

    return cookie;
  }
  static setCookieByKey(key, value) {
    let expires = new Date(Date.now());
    expires.setDate(expires.getDate() + 1);
    document.cookie = `${key}=${value}; expires=${expires}; `;
  }
}
