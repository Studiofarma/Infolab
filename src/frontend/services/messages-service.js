const axios = require("axios").default;

export class MessagesService {
  static async getMessagesById(id) {
    return axios.get(`http://localhost:3000/messages?id=${id}`);
  }
}
