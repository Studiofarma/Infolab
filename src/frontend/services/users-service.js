import { UserDto } from "../models/user-dto";
import { CommandsService } from "./commands-service";
import { HttpService } from "./http-service";
import { StorageService } from "./storage-service";

export class UsersService {
  /**
   * @param {Array} usernames an array of usernames as string values
   */
  static async getUsers(usernames) {
    let users = [];

    let sessionUsers = StorageService.getItemByKey(StorageService.Keys.users);

    if (sessionUsers) {
      let usernamesToFetch = [];

      let alreadyPresentUsers = [];

      usernames.forEach((username) => {
        let index = sessionUsers.findIndex((user) => user.name === username);

        if (index === -1) {
          // The user is not stored so I will need to fetch it
          usernamesToFetch.push(username);
        } else {
          alreadyPresentUsers.push(sessionUsers[index]);
        }
      });

      if (usernamesToFetch.length !== 0) {
        users = await this.getUsersByUsernames(usernamesToFetch);
      }

      let allUsers = [...sessionUsers, ...users];

      StorageService.setItemByKeySession(StorageService.Keys.users, allUsers);

      users = [...alreadyPresentUsers, ...users];
    } else {
      users = await this.getUsersByUsernames(usernames);

      StorageService.setItemByKeySession(StorageService.Keys.users, users);
    }

    return users;
  }

  static async getLoggedUser() {
    let loggedUser;

    const sessionUser = StorageService.getItemByKey(
      StorageService.Keys.loggedUser
    );

    if (sessionUser) {
      loggedUser = sessionUser;
    } else {
      try {
        loggedUser = (await HttpService.httpGet("/api/users/loggeduser")).data;
      } catch (error) {
        console.error(error);
      }

      let basicAuth = window.btoa(
        loggedUser.name +
          ":" +
          StorageService.getItemByKey(StorageService.Keys.password)
      );

      if (loggedUser.avatarLink !== null) {
        let link = `${
          loggedUser.avatarLink
        }?cacheInvalidator=${new Date().toISOString()}&basic=`;
        // Note that cache invalidator is needed because even if the image changes the link will remain the same. Adding that part makes the browser refetch the image.

        if (CommandsService.isDevOrTest()) {
          link += basicAuth.toString();
        }

        loggedUser = {
          ...loggedUser,
          avatarLink: link,
        };
      }

      loggedUser = new UserDto(loggedUser);

      StorageService.setItemByKeySession(
        StorageService.Keys.loggedUser,
        loggedUser
      );
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

    const loggedUser = await UsersService.getLoggedUser();

    let basicAuth = window.btoa(
      loggedUser.name +
        ":" +
        StorageService.getItemByKey(StorageService.Keys.password)
    );

    users.data = users.data.map((user) => {
      if (user.avatarLink === null) {
        return user;
      }

      let link = `${
        user.avatarLink
      }?cacheInvalidator=${new Date().toISOString()}&basic=`;
      // Note that cache invalidator is needed because even if the image changes the link will remain the same. Adding that part makes the browser refetch the image.

      if (CommandsService.isDevOrTest()) {
        link += basicAuth.toString();
      }

      return {
        ...user,
        avatarLink: link,
      };
    });

    users.data = users.data.map((user) => {
      return new UserDto(user);
    });

    return users.data;
  }

  static updateUserStatusInSessionStorage(username, status) {
    let sessionUsers = StorageService.getItemByKey(StorageService.Keys.users);

    if (sessionUsers) {
      let index = sessionUsers.findIndex((item) => item.name === username);

      if (index > -1) {
        sessionUsers[index] = {
          ...sessionUsers[index],
          status: status,
        };
      }

      StorageService.setItemByKeySession(
        StorageService.Keys.users,
        sessionUsers
      );
    }
  }

  static updateLoggedUserInSessionStorage(objectWithProperties) {
    let loggedUser = StorageService.getItemByKey(
      StorageService.Keys.loggedUser
    );

    if (loggedUser) {
      loggedUser = {
        ...loggedUser,
        ...objectWithProperties,
      };

      StorageService.setItemByKeySession(
        StorageService.Keys.loggedUser,
        loggedUser
      );
    }
  }

  static deleteLoggedUserFromSessionStorage() {
    StorageService.deleteItemByKeyFromSession(StorageService.Keys.loggedUser);
  }
}
