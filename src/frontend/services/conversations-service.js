import { ConversationDto } from "../models/conversation-dto";
import { HttpService } from "./http-service";

export class ConversationService {
  static pageSize = 11;
  static startingLink = `/api/rooms2?page[size]=${ConversationService.pageSize}`;

  static conversationList = "conversationList";
  static forwardList = "forwardList";

  static afterLinks = new Map([
    [ConversationService.conversationList, ConversationService.startingLink],
    [ConversationService.forwardList, ConversationService.startingLink],
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

  static resetMapEntry(clientComponentName) {
    ConversationService.afterLinks.set(
      clientComponentName,
      ConversationService.startingLink
    );
  }
}
