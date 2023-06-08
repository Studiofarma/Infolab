const axios = require("axios").default;
import { CookieService } from "./cookie-service";

export class CreatePrivateRoomService {
	static async createPrivateRoom(user) {
		let cookie = CookieService.getCookie();
		return axios({
			url: `/api/rooms/${user}`,
			method: "post",
			headers: {
				"X-CSRF-TOKEN": cookie.token,
			},
			auth: {
				username: cookie.username,
				password: cookie.password,
			},
		});
	}
}
