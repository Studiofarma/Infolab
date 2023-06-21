const USERNAME_COOKIE_NAME = "username";
const PASSWORD_COOKIE_NAME = "password";
const HEADER_COOKIE_NAME = "header";
const TOKEN_COOKIE_NAME = "token";

export class CookieService {
	static COOKIE_NAMES = {
		USERNAME: "username",
		PASSWORD: "password",
		HEADER: "header",
		TOKEN: "token",
		LAST_CHAT: "last-chat",
	};

	static getCookieByKey(name) {
		const result = document.cookie
			.split("; ")
			.find((row) => row.startsWith(`${name}=`))
			?.split("=")[1];

		return result;
	}
	static getLoginCookies() {
		let isValid = true;
		const user = CookieService.getCookieByKey(
			CookieService.COOKIE_NAMES.USERNAME
		);
		if (!user) isValid = false;

		const pass = CookieService.getCookieByKey(
			CookieService.COOKIE_NAMES.PASSWORD
		);
		if (!pass) isValid = false;

		const header = CookieService.getCookieByKey(
			CookieService.COOKIE_NAMES.HEADER
		);
		if (!header) isValid = false;

		const token = CookieService.getCookieByKey(
			CookieService.COOKIE_NAMES.TOKEN
		);
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
	static setCookieByKey(key, value) {
		let expires = new Date(Date.now());
		expires.setDate(expires.getDate() + 1);
		document.cookie = `${key}=${value}; expires=${expires}; `;
	}
}
