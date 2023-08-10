import { ConversationDto } from "../models/conversation-dto";
import { HttpService } from "./http-service";

export class ConversationService {
  static pageSize = 11;
  static afterLink = `/api/rooms2?page[size]=${ConversationService.pageSize}`;

  static conversationList = "conversationList";
  static forwardList = "forwardList";

  static afterLinks = new Map([
    [
      ConversationService.conversationList,
      `/api/rooms2?page[size]=${ConversationService.pageSize}`,
    ],
    [
      ConversationService.forwardList,
      `/api/rooms2?page[size]=${ConversationService.pageSize}`,
    ],
  ]);

  static async getOpenConversations() {
    let conversations = (await HttpService.httpGet("/api/rooms")).data;

    return conversations.data.map((conversation) => {
      return new ConversationDto(conversation);
    });
  }

  static async getNextConversations(clientComponentName) {
    let conversations = (
      await HttpService.httpGet(
        encodeURI(ConversationService.afterLinks.get(clientComponentName))
      )
    ).data;

    ConversationService.afterLinks.set(
      clientComponentName,
      conversations.links.next
    );

    return conversations.data.map((conversation) => {
      return new ConversationDto(conversation);
    });
  }
}
