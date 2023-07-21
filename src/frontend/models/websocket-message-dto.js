import { MessageDto } from "./message-dto";

export class WebSocketMessageDto {
  type = "";
  chat = {
    id: 0,
    content: "",
    timestamp: "",
    sender: "",
    roomName: "",
    status: "",
  };
  edit = {
    id: 0,
    content: "",
    timestamp: "",
    sender: "",
    roomName: "",
    status: "",
  };
  delete = {
    id: 0,
    content: "",
    timestamp: "",
    sender: "",
    roomName: "",
    status: "",
  };

  constructor(obj) {
    this.type = obj.type !== undefined ? obj.type : "";
    this.chat = obj.chat !== undefined ? obj.chat : {};
    this.edit = obj.edit !== undefined ? obj.edit : {};
    this.delete = obj.delete !== undefined ? obj.delete : {};
  }
}
