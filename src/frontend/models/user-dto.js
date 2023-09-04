export class UserDto {
  id = 0;
  name = "";
  description = "";
  status = "";
  avatarLink = "";
  theme = "";

  constructor(obj) {
    this.id = obj.id !== undefined ? obj.id : 0;
    this.name = obj.name !== undefined ? obj.name : "";
    this.description = obj.description !== undefined ? obj.description : "";
    this.status = obj.status !== undefined ? obj.status : "";
    this.avatarLink = obj.avatarLink !== undefined ? obj.avatarLink : "";
    this.theme = obj.theme !== undefined ? obj.theme : "";
  }
}
