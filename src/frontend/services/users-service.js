import { UserDto } from "../models/user-dto";
import { CookieService } from "./cookie-service";

const axios = require("axios").default;

const loggedUserKey = "logged-user";

export class UsersService {
  static cookie = CookieService.getCookie();

  static async getUsers(query, username, password) {
    let users = await axios({
      url: `/api/users?user=${query}`,
      method: "get",
      headers: {
        "X-Requested-With": "XMLHttpRequest",
      },
      auth: {
        username: username,
        password: password,
      },
    });

    // #region Mock data
    // TODO: remove this region when data comes from BE
    users.data.forEach((user, index) => {
      user.status = index % 2 === 0 ? "online" : "offline";
    });

    users.data.forEach((user) => {
      user.avatarLink = "";
    });
    // #endregion

    if (query !== "") {
      users.data = users.data.filter((user) =>
        user.description.includes(query)
      );
    }

    users.data = users.data.map((user) => {
      return new UserDto(user);
    });

    return users.data;
  }

  static async getLoggedUser() {
    let loggedUser;

    const sessionUser = sessionStorage.getItem(loggedUserKey);

    if (sessionUser) {
      loggedUser = JSON.parse(sessionUser);
    } else {
      let usersList;
      try {
        usersList = await UsersService.getUsers(
          "",
          this.cookie.username,
          this.cookie.password
        );
      } catch (error) {
        console.error(error);
      }

      loggedUser = usersList.filter(
        (user) => user.name === this.cookie.username
      );

      sessionStorage.setItem(loggedUserKey, JSON.stringify(loggedUser));
    }

    return loggedUser;
  }

  static setUserDescription(newDescription) {
    // TODO: implementare la chiamata
  }

  static setUserAvatar(imageBlob) {
    // TODO: implementare la chiamata
  }
}
