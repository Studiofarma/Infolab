const axios = require("axios").default;
const allUsers = "all-users";

export class UsersService {
  static async getUsers(query, username, password) {
    // return await axios({
    //   url: `/api/users?user=${query}`,
    //   method: "get",
    //   headers: {
    //     "X-Requested-With": "XMLHttpRequest",
    //   },
    //   auth: {
    //     username: username,
    //     password: password,
    //   },
    // });

    let usersData;

    const sessionUsers = sessionStorage.getItem(allUsers);

    if (sessionUsers) {
      usersData = JSON.parse(sessionUsers);
    } else {
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

      users.data.forEach((user, index) => {
        user.status = index % 2 === 0 ? "online" : "offline";
      });

      users.data.forEach((user) => {
        user.avatarLink = "";
      });

      usersData = users["data"];

      sessionStorage.setItem(allUsers, JSON.stringify(usersData));
    }

    return usersData;
  }

  static setUserDescription(newDescription) {
    // TODO: implementare la chiamata
  }

  static setUserAvatar(imageBlob) {
    // TODO: implementare la chiamata
  }
}
