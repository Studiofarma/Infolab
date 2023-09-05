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
    let loggedUser;

    const sessionUser = sessionStorage.getItem(loggedUserKey);

    if (sessionUser) {
      loggedUser = JSON.parse(sessionUser);
    } else {
      try {
        loggedUser = (await HttpService.httpGet("/api/users/loggeduser")).data;
      } catch (error) {
        console.error(error);
      }

      let basicAuth = window.btoa(
        UsersService.cookie.username + ":" + UsersService.cookie.password
      );

      if (loggedUser.avatarLink !== null) {
        loggedUser = {
          ...loggedUser,
          avatarLink: `${
            loggedUser.avatarLink
          }?access_token=${basicAuth.toString()}&cacheInvalidator=${new Date().toISOString()}`, // Note that cache invalidator is needed because even if the image changes the link will remain the same. Adding that part makes the browser refetch the image.
        };
      }

      loggedUser = new UserDto(loggedUser);

      sessionStorage.setItem(loggedUserKey, JSON.stringify(loggedUser));
    }

    return loggedUser;
  }

  /**
   * @param {Array} usernames an array of usernames as string values
   */
  static async getUsersByUsernames(usernames) {
    if (usernames.length === 0)
      throw Error("Empty array provided as parameter.");

    let queryString = usernames.toString();

    let users = await HttpService.httpGet(
      `/api/users?usernames=${queryString}`
    );

    let basicAuth = window.btoa(
      UsersService.cookie.username + ":" + UsersService.cookie.password
    );

    users.data = users.data.map((user) => {
      if (user.avatarLink === null) {
        return user;
      }
      return {
        ...user,
        avatarLink: `${
          user.avatarLink
        }?access_token=${basicAuth.toString()}&cacheInvalidator=${new Date().toISOString()}`, // Note that cache invalidator is needed because even if the image changes the link will remain the same. Adding that part makes the browser refetch the image.
      };
    });

    users.data = users.data.map((user) => {
      return new UserDto(user);
    });

    return users.data;
  }

  static updateUserStatusInSessionStorage(username, status) {
    let sessionUsers = JSON.parse(sessionStorage.getItem(usersKey));

    if (sessionUsers) {
      let index = sessionUsers.findIndex((item) => item.name === username);

      if (index > -1) {
        sessionUsers[index] = {
          ...sessionUsers[index],
          status: status,
        };
      }

      sessionStorage.setItem(usersKey, JSON.stringify(sessionUsers));
    }
  }

  static updateLoggedUserInSessionStorage(objectWithProperties) {
    let loggedUser = JSON.parse(sessionStorage.getItem(loggedUserKey));

    if (loggedUser) {
      loggedUser = {
        ...loggedUser,
        ...objectWithProperties,
      };

      sessionStorage.setItem(loggedUserKey, JSON.stringify(loggedUser));
    }
  }

  static invalidateLoggedUserInSessionStorage() {
    sessionStorage.removeItem(loggedUserKey);
  }
}
