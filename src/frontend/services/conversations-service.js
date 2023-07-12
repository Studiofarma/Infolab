import { ConversationDto } from "../models/conversation-dto";
import { HttpService } from "./http-service";

const axios = require("axios").default;

export class ConversationService {
  static async getOpenConversations(username, password) {
    let conversations = await HttpService.httpGet("/api/rooms");

    return conversations.data.map((conversation) => {
      return new ConversationDto(conversation);
    });
  }
}
