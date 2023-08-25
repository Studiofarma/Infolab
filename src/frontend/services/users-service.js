import { UserDto } from "../models/user-dto";
import { CookieService } from "./cookie-service";
import { HttpService } from "./http-service";

const loggedUserKey = "logged-user";

export class UsersService {
  static cookie = CookieService.getCookie();

  static async getUsers(query) {
    let users = await HttpService.httpGetWithHeaders(
      `/api/users?user=${query}`,
      {
        "X-Requested-With": "XMLHttpRequest",
      }
    );

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
    let cookie = CookieService.getCookie();

    let loggedUser;

    const sessionUser = sessionStorage.getItem(loggedUserKey);

    if (sessionUser) {
      loggedUser = JSON.parse(sessionUser);
    } else {
      let usersList;
      try {
        usersList = await UsersService.getUsersByUsernames([cookie.username]);
      } catch (error) {
        console.error(error);
      }

      loggedUser = usersList.filter((user) => user.name === cookie.username);

      sessionStorage.setItem(loggedUserKey, JSON.stringify(loggedUser));
    }

    return loggedUser[0];
  }

  static setUserDescription(newDescription) {
    // TODO: implementare la chiamata
  }

  static setUserAvatar(imageBlob) {
    // TODO: implementare la chiamata
  }

  /**
   *
   * @param {Array} usernames
   */
  static async getUsersByUsernames(usernames) {
    if (usernames.length === 0)
      throw Error("Empty array provided as parameter.");

    let queryString = usernames.toString();

    let users = await HttpService.httpGet(
      `/api/users?usernames=${queryString}`
    );

    // #region Mock data
    // TODO: remove this region when data comes from BE
    users.data.forEach((user, index) => {
      user.status = index % 2 === 0 ? "online" : "offline";
    });

    users.data.forEach((user) => {
      user.avatarLink = "";
    });
    // #endregion

    users.data = users.data.map((user) => {
      return new UserDto(user);
    });

    return users.data;
  }
}
