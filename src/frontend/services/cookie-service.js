const USERNAME_COOKIE_NAME = "username";
const PASSWORD_COOKIE_NAME = "password";
const HEADER_COOKIE_NAME = "header";
const TOKEN_COOKIE_NAME = "token";

function getCookiePropertyByName(name) {
  const result = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1];

  return result;
}

export class CookieService {
  static getCookie() {
    let isValid = true;
    const user = getCookiePropertyByName(USERNAME_COOKIE_NAME);
    if (!user) isValid = false;

    const pass = getCookiePropertyByName(PASSWORD_COOKIE_NAME);
    if (!pass) isValid = false;

    const header = getCookiePropertyByName(HEADER_COOKIE_NAME);
    if (!header) isValid = false;

    const token = getCookiePropertyByName(TOKEN_COOKIE_NAME);
    if (!token) isValid = false;

    let cookie = {
      username: user,
      password: pass,
      token: token,
      header: header,
      isValid: isValid,
    };

    return cookie;
  }
}
