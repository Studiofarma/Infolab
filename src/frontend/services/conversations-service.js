import { ConversationDto } from "../models/conversation-dto";
import { HttpService } from "./http-service";

export class ConversationService {
  static async getOpenConversations() {
    let conversations = await HttpService.httpGet("/api/rooms");

    return conversations.data.map((conversation) => {
      return new ConversationDto(conversation);
    });
  }
}
