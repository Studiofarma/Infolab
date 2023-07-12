export class MessageDto {
  id = 0;
  content = "";
  timestamp = "";
  sender = "";
  roomName = "";
  hasBeenEdited = false;
  hasBeenDeleted = false;

  constructor(obj) {
    this.id = obj.id !== undefined ? obj.id : 0;
    this.content = obj.content !== undefined ? obj.content : "";
    this.timestamp = obj.timestamp !== undefined ? obj.timestamp : "";
    this.sender = obj.sender !== undefined ? obj.sender : "";
    this.roomName = obj.roomName !== undefined ? obj.roomName : "";
    this.hasBeenEdited =
      obj.hasBeenEdited !== undefined ? obj.hasBeenEdited : false;
    this.hasBeenDeleted =
      obj.hasBeenDeleted !== undefined ? obj.hasBeenDeleted : false;
  }
}
