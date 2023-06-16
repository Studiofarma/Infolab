const axios = require("axios").default;

export class MessagesService {
	static async getMessagesById(username, password, roomName) {
		return axios({
			url: `/api/messages/${roomName}`,
			method: "get",
			auth: {
				username: username,
				password: password,
			},
		});
	}
}
