import { MessageStatuses } from "../enums/message-statuses";

export class MessageDto {
  id = 0;
  content = "";
  timestamp = "";
  sender = "";
  roomName = "";
  status = "";

  constructor(obj) {
    this.id = obj.id !== undefined ? obj.id : 0;
    this.content = obj.content !== undefined ? obj.content : "";
    this.timestamp = obj.timestamp !== undefined ? obj.timestamp : "";
    this.sender = obj.sender !== undefined ? obj.sender : "";
    this.roomName = obj.roomName !== undefined ? obj.roomName : "";
    this.status = obj.status !== undefined ? obj.status : "";
  }

  hasBeenDeleted() {
    return this.status === MessageStatuses.deleted;
  }

  hasBeenEdited() {
    return this.status === MessageStatuses.edited;
  }
}
