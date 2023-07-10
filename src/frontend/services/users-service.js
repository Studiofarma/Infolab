import { CookieService } from "./cookie-service";

const axios = require("axios").default;
const allUsersKey = "all-users";
const loggedUserKey = "logged-user";

export class UsersService {
  cookie = CookieService.getCookie();

  static async getUsers(query, username, password) {
    let usersData;

    usersData =
      await UsersService.#tryGettingFromSessionStorageOrElseFetchAndSave(
        allUsersKey,
        async () => {
          let users = await axios({
            url: `/api/users?user=`,
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

          return users.data;
        }
      );

    if (query !== "") {
      usersData = usersData.filter((user) => user.description.includes(query));
    }

    return usersData;
  }

  static async getLoggedUser() {
    let loggedUser;

    loggedUser = UsersService.#tryGettingFromSessionStorageOrElseFetchAndSave(
      loggedUserKey,
      async () => {
        let usersList;
        try {
          usersList = await UsersService.getUsers(
            "",
            cookie.username,
            cookie.password
          );
        } catch (error) {
          console.error(error);
        }

        return usersList.filter((user) => user.name === cookie.username);
      }
    );

    return loggedUser;
  }

  /**
   * @param {Function} fetchFunction should return data (list or not) of what you want to fetch
   */
  static async #tryGettingFromSessionStorageOrElseFetchAndSave(
    key,
    fetchFunction
  ) {
    let data;

    const sessionData = sessionStorage.getItem(key);

    if (sessionData) {
      data = JSON.parse(sessionData);
    } else {
      console.log("Sos");
      data = await fetchFunction();

      sessionStorage.setItem(key, JSON.stringify(data));
    }

    return data;
  }

  static setUserDescription(newDescription) {
    // TODO: implementare la chiamata
  }

  static setUserAvatar(imageBlob) {
    // TODO: implementare la chiamata
  }
}
