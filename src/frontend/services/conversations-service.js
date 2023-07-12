import { ConversationDto } from "../models/conversation-dto";

const axios = require("axios").default;

export class ConversationService {
  static async getOpenConversations(username, password) {
    let conversations = await axios({
      url: "/api/rooms",
      method: "get",
      auth: {
        username: username,
        password: password,
      },
    });

    return conversations.data.map((conversation) => {
      return new ConversationDto(conversation);
    });
  }
}
