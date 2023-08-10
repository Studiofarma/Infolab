import { ConversationDto } from "../models/conversation-dto";
import { HttpService } from "./http-service";

export class ConversationService {
  static pageSize = 8;
  static afterLink = `/api/rooms2?page[size]=${ConversationService.pageSize}`;

  static async getOpenConversations() {
    let conversations = (await HttpService.httpGet("/api/rooms")).data;

    return conversations.data.map((conversation) => {
      return new ConversationDto(conversation);
    });
  }

  static async getNextConversations() {
    let conversations = (
      await HttpService.httpGet(encodeURI(ConversationService.afterLink))
    ).data;

    ConversationService.afterLink = conversations.links.next;

    return conversations.data.map((conversation) => {
      return new ConversationDto(conversation);
    });
  }
}
