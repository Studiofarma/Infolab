export class ConversationDto {
  id = 0;
  roomName = "";
  avatarLink = "";
  unreadMessages = 0;
  lastMessage = {
    content: "",
    sender: {
      name: "",
      id: 0,
      description: "",
    },
    timestamp: "",
  };
  description = "";

  constructor(obj) {
    this.id = obj.id !== undefined ? obj.id : 0;
    this.roomName = obj.roomName !== undefined ? obj.roomName : "";
    this.avatarLink = obj.avatarLink !== undefined ? obj.avatarLink : "";
    this.unreadMessages =
      obj.unreadMessages !== undefined ? obj.unreadMessages : 0;
    this.lastMessage = obj.lastMessage !== undefined ? obj.lastMessage : "";
    this.description = obj.description !== undefined ? obj.description : "";
  }
}
