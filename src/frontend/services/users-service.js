const axios = require("axios").default;

export class UsersService {
	static async GetUsers(query) {
		return axios({
			url: `/api/users?user=${query}`,
			method: "get",
			headers: {
				"X-Requested-With": "XMLHttpRequest",
			},
		});
	}
}
