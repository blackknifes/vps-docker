import nedb from "nedb-promises";
import ExpressApp from "./ExpressApp"
import UserService from "./UserService"

(async function () {
    let db = nedb.create("D:/upload/test.db");
    await db.load();

    const app = new ExpressApp();
    let userService = new UserService(db);
    app.get("/register", function ({ request, response, params, body }) {
        return userService.register(body);
    });

    app.post("/login", function ({ params }) {
        return userService.login(params);
    });

    await app.listen(80);
})();