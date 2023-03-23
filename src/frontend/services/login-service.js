const axios = require("axios").default;

export class LoginService {
    static async getLogin(username, password) {
        return axios({
            url: "/csrf",
            method: "get",
            headers: {
                "X-Requested-With": "XMLHttpRequest",
            },
            auth: {
                username: username,
                password: password,
            },
        });
    }
}