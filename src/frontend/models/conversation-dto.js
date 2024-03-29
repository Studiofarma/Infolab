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
    id: 0,
    content: "",
    sender: {
      name: "",
      id: 0,
      description: "",
    },
    timestamp: "",
  };
  otherParticipants = [];

  static roomVisibilityEnum = {
    private: "PRIVATE",
    public: "PUBLIC",
  };

  static roomTypeEnum = {
    user: "USER2USER",
    group: "GROUP",
  };

  constructor(obj) {
    this.id = obj.id !== undefined ? obj.id : 0;
    this.roomName = obj.roomName !== undefined ? obj.roomName : "";
    this.avatarLink = obj.avatarLink !== undefined ? obj.avatarLink : "";
    this.unreadMessages =
      obj.unreadMessages !== undefined ? obj.unreadMessages : 0;
    this.lastReadTimestamp =
      obj.lastReadTimestamp !== undefined ? obj.lastReadTimestamp : "";
    this.description = obj.description !== undefined ? obj.description : "";
    this.visibility =
      obj.visibility !== undefined
        ? obj.visibility
        : this.roomVisibilityEnum?.private;
    this.roomType =
      obj.roomType !== undefined ? obj.roomType : this.roomTypeEnum?.user;
    this.roomOrUser = obj.roomOrUser !== undefined ? obj.roomOrUser : "";
    this.lastMessage = obj.lastMessage !== undefined ? obj.lastMessage : "";
    this.otherParticipants =
      obj.otherParticipants !== undefined ? obj.otherParticipants : [];
  }
}
