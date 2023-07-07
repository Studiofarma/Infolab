const axios = require("axios").default;

export class UsersService {
  static async GetUsers(query, username, password) {
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

    return new Promise((resolve) => {
      resolve(users);
    });
  }

  static setUserDescription(newDescription) {
    // TODO: implementare la chiamata
  }

  static setUserAvatar(imageBlob) {
    // TODO: implementare la chiamata
  }
}
