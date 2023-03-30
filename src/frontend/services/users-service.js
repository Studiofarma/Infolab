const axios = require("axios").default;


export class UsersService {
    static async GetUsers() {
        return axios({
            url: "http://localhost:3000/users",
            method: "get",
            headers: {
                "X-Requested-With": "XMLHttpRequest",
            },
        });
    }
}