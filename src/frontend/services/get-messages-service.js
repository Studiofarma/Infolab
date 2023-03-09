const axios = require("axios").default;

export class getMessagesServices {
  static async executeMessagesCall(id) {
    return axios.get(`http://localhost:3000/messages?id=${id}`);
  }
}
