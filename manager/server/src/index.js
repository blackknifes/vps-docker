import Database from "./Database";
import ExpressApp from "./ExpressApp"
import UserService from "./UserService"
import ConfigParser from "@webantic/nginx-config-parser";

import fs from "fs-extra";
import path from "path";
import glob from "glob-promise"

async function loadFunction(filepath) {
    let parser = new ConfigParser();
    let dir = path.dirname(filepath);
    let content = await fs.readFile(filepath, "utf-8");
    let configs = {};
    let rootConfig = parser.parse(content);
    configs.root = rootConfig;

    let includes = rootConfig.http.include;
    for (let i = 0; i < includes.length; ++i) {
        let includePath = path.resolve(dir, includes[i]);
        let stat;
        if (fs.existsSync(includePath) && (stat = await fs.stat(includePath)).isFile()) {
            content = await fs.readFile(includePath, "utf-8");
            configs[includes[i]] = parser.parse(content);
        }
        else {
            let files = await glob.promise(includePath);
            for (let j = 0; j < files.length; j++) {
                const file = files[j];
                content = await fs.readFile(file);
                configs[includes[i]] = parser.parse(content);
            }
        }
    }
    return configs;
}

(async function () {

    let configs = await loadFunction("D:/lkq/tools/vps-docker/nginx/nginx/nginx.conf");
    console.log(configs);

    let db = new Database("D:/upload/test.db");
    await db.load();

    const app = new ExpressApp();
    let userService = new UserService(db);
    app.post("/register", function ({ request, response, params, body }) {
        return userService.register(body);
    });

    app.post("/login", function ({ body }) {
        return userService.login(body.username, body.password);
    });

    app.post("/user/update", function ({ body }) {
        return userService.update(body);
    });

    await app.listen(80);
})();