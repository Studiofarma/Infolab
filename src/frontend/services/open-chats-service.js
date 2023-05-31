const axios = require("axios").default;

export class OpenChatsService {
  static async getOpenChats(username, password) {
    return axios({
      url: "/api/rooms",
      method: "get",
      auth: {
        username: username,
        password: password,
      },
    });
  }
}
