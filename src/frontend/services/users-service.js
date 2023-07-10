import { CookieService } from "./cookie-service";

const axios = require("axios").default;
const allUsersKey = "all-users";
const loggedUserKey = "logged-user";

export class UsersService {
  cookie = CookieService.getCookie();

  static async getUsers(query, username, password) {
    let usersData;

    const sessionUsers = sessionStorage.getItem(allUsersKey);

    if (sessionUsers) {
      usersData = JSON.parse(sessionUsers);
    } else {
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

      usersData = users.data;

      sessionStorage.setItem(allUsersKey, JSON.stringify(usersData));
    }

    if (query !== "") {
      usersData = usersData.filter((user) => user.description.includes(query));
    }
    console.log(usersData);

    return usersData;
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
          cookie.username,
          cookie.password
        );
      } catch (error) {
        console.error(error);
      }

      loggedUser = usersList.filter((user) => user.name === cookie.username);

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
