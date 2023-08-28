import { UserDto } from "../models/user-dto";
import { CookieService } from "./cookie-service";
import { HttpService } from "./http-service";

const loggedUserKey = "logged-user";
const usersKey = "users";

export class UsersService {
  static cookie = CookieService.getCookie();

  /**
   * @param {Array} usernames an array of usernames as string values
   */
  static async getUsers(usernames) {
    let users = [];

    let sessionUsers = JSON.parse(sessionStorage.getItem(usersKey));

    if (sessionUsers) {
      let usernamesToFetch = [];

      let alreadyPresentUsers = [];

      usernames.forEach((username) => {
        let index = sessionUsers.findIndex((user) => user.name === username);

        if (index === -1) {
          // The user is not present inside the sessionStorage so I will need to fetch it
          usernamesToFetch.push(username);
        } else {
          alreadyPresentUsers.push(sessionUsers[index]);
        }
      });

      if (usernamesToFetch.length !== 0) {
        users = await this.getUsersByUsernames(usernamesToFetch);
      }

      let allUsers = [...sessionUsers, ...users];

      sessionStorage.setItem(usersKey, JSON.stringify(allUsers));

      users = [...alreadyPresentUsers, ...users];
    } else {
      users = await this.getUsersByUsernames(usernames);

      sessionStorage.setItem(usersKey, JSON.stringify(users));
    }

    return users;
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
   * @param {Array} usernames an array of usernames as string values
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
