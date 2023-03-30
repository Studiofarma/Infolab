const axios = require("axios").default;

export class MessagesService {
  static async getMessagesById(username, password) {
    return axios({
      url: `/api/messages/general`,
      method: "get",
      auth: {
        username: username,
        password: password,
      },
    });
  }
}
