import { ConversationDto } from "../models/conversation-dto";
import { HttpService } from "./http-service";

export class ConversationService {
  static pageSize = 11;
  static startingLink = `/api/rooms?page[size]=${ConversationService.pageSize}`;
  static startingLinkSearch = `/api/rooms/search?page[size]=${ConversationService.pageSize}`;

  static conversationList = "conversationList";
  static conversationListSearch = `${ConversationService.conversationList}-search`;
  static forwardList = "forwardList";
  static forwardListSearch = `${ConversationService.forwardList}-search`;

  static afterLinks = new Map([
    [ConversationService.conversationList, ConversationService.startingLink],
    [ConversationService.forwardList, ConversationService.startingLink],
    [
      ConversationService.conversationListSearch,
      `${ConversationService.startingLinkSearch}&nameToSearch=`,
    ],
    [
      ConversationService.forwardListSearch,
      `${ConversationService.startingLinkSearch}&nameToSearch=`,
    ],
  ]);

  static lastQuery = new Map([
    [ConversationService.conversationListSearch, ""],
    [ConversationService.forwardListSearch, ""],
  ]);

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

  static async getNextConversationsFiltered(clientComponentName, query) {
    let link;

    if (ConversationService.lastQuery.get(clientComponentName) === query) {
      link = ConversationService.afterLinks.get(clientComponentName);
    } else {
      link = `${ConversationService.startingLinkSearch}&nameToSearch=${query}`;
      ConversationService.lastQuery.set(clientComponentName, query);
    }

    let conversations = (await HttpService.httpGet(encodeURI(link))).data;

    ConversationService.afterLinks.set(
      clientComponentName,
      conversations.links.next
    );

    return conversations.data.map((conversation) => {
      return new ConversationDto(conversation);
    });
  }

  static resetAfterLink(clientComponentName) {
    let link = clientComponentName.includes("-search")
      ? ConversationService.startingLinkSearch
      : ConversationService.startingLink;

    ConversationService.afterLinks.set(clientComponentName, link);
  }

  static resetLastQuery(clientComponentName) {
    ConversationService.lastQuery.set(clientComponentName, null);
    ConversationService.resetAfterLink(clientComponentName);
  }
}
