export class ConversationDto {
	id = 0;
	roomName = "";
	avatar = "";
	unreadMessages = 0;
	lastMessage = { content: "", sender: "", timestamp: "" };

	constructor(obj) {
		this.id = obj.id !== undefined ? obj.id : 0;
		this.roomName = obj.roomName !== undefined ? obj.roomName : "";
		this.avatarLink = obj.avatarLink !== undefined ? obj.avatarLink : "";
		this.unreadMessages =
			obj.unreadMessages !== undefined ? obj.unreadMessages : 0;
		this.lastMessage = obj.lastMessage !== undefined ? obj.lastMessage : "";
	}
}
