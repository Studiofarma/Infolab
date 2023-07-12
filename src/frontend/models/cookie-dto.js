export class CookieDto {
  username = "";
  password = "";
  header = "";
  token = "";
  lastChat = "";
  lastDescription = "";
  isValid = false;

  constructor(obj) {
    this.username = obj.username !== undefined ? obj.username : "";
    this.password = obj.password !== undefined ? obj.password : "";
    this.header = obj.header !== undefined ? obj.header : "";
    this.token = obj.token !== undefined ? obj.token : "";
    this.lastChat = obj.lastChat !== undefined ? obj.lastChat : "";
    this.lastDescription =
      obj.lastDescription !== undefined ? obj.lastDescription : "";
    this.isValid = obj.isValid !== undefined ? obj.isValid : false;
  }
}
