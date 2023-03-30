const axios = require("axios").default;

export class OpenChatsService {
  static async getOpenChats() {
    return axios({
      url: "http://localhost:3000/openChats",
      method: "get",
      headers: {
        "X-Requested-With": "XMLHttpRequest",
      },
    });
  }
}
