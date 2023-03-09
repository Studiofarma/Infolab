export class ConversationDto {
  id = 0;
  name = "";
  avatar = "";
  lastMessage = "";
  unread = 0;

  constructor(obj) {
    this.id = obj.id !== undefined ? obj.id : 0;
    this.name = obj.name !== undefined ? obj.name : "";
    this.avatar = obj.avatar !== undefined ? obj.avatar : "";
    this.lastMessage = obj.lastMessage !== undefined ? obj.lastMessage : "";
    this.unread = obj.unread !== undefined ? obj.unread : 0;
  }
}
