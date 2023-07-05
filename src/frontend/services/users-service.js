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

    users.data.forEach((_, index) => {
      users.data[index].status = index % 2 === 0 ? "online" : "offline";
    });

    return new Promise((resolve) => {
      resolve(users);
    });
  }
}
