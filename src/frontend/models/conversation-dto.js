export class ConversationDto {
  id = 0;
  roomName = "";
  avatarLink = "";
  unreadMessages = 0;
  lastReadTimestamp = "";
  description = "";
  visibility = "";
  roomType = "";
  roomOrUser = "";
  lastMessage = {
    content: "",
    sender: {
      name: "",
      id: 0,
      description: "",
    },
    timestamp: "",
  };
  otherParticipants = [];

  constructor(obj) {
    this.id = obj.id !== undefined ? obj.id : 0;
    this.roomName = obj.roomName !== undefined ? obj.roomName : "";
    this.avatarLink = obj.avatarLink !== undefined ? obj.avatarLink : "";
    this.unreadMessages =
      obj.unreadMessages !== undefined ? obj.unreadMessages : 0;
    this.lastReadTimestamp =
      obj.lastReadTimestamp !== undefined ? obj.lastReadTimestamp : "";
    this.description = obj.description !== undefined ? obj.description : "";
    this.visibility = obj.visibility !== undefined ? obj.visibility : "";
    this.roomType = obj.roomType !== undefined ? obj.roomType : "";
    this.roomOrUser = obj.roomOrUser !== undefined ? obj.roomOrUser : "";
    this.lastMessage = obj.lastMessage !== undefined ? obj.lastMessage : "";
    this.otherParticipants =
      obj.otherParticipants !== undefined ? obj.otherParticipants : [];
  }
}
