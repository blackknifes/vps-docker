import nedb from "nedb-promises";
import crypto from "crypto";
import ExpressApp from "./ExpressApp";
import Result from "./Result";

function sha256(value) {
    let digest = crypto.createHash("sha256");
    return digest.update(value).digest().toString("hex");
}

function genSalt() {
    let salt = "";
    let hexs = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', '_', '~', '=', '+'];
    for (let i = 0; i < 16; i++)
        salt += hexs[parseInt(Math.random() * hexs.length)];
    return salt;
}

class UserService {
    /**@type {nedb} */
    db;

    /**
     * 
     * @param {nedb} db 
     */
    constructor(db) {
        this.db = db;
    }

    /**
     * 
     * @param {{username: string, password: string, realname: string, phone: string, sex?: number, email?: string}} user 
     */
    async register(user) {
        let session = ExpressApp.session;
        if (!user.username || user.username.length > 16)
            return Result.fail("username参数格式错误");
        if (!user.password || user.password.length > 16)
            return Result.fail("password参数格式错误");
        if (!user.realname || user.realname.length > 16)
            return Result.fail("realname参数格式错误");
        if (!user.realname || !/$[1-9][0-9]{10}/g.test(user.phone))
            return Result.fail("phone参数格式错误");

        let userDb = await this.db.findOne({ table: "user", username })
        if (userDb)
            return Result.fail("用户名已存在");
        user.table = "user";
        user.salt = genSalt();
        user.password = sha256(user.password + user.salt);
        await this.db.insert(user);
        user.status = true;
        session.user = user;
        return Result.ok();
    }

    /**
     * 登录
     * @param {string} username 
     * @param {string} password 
     * @param {string} salt 
     * @returns 
     */
    async login(username, password, salt) {
        let session = ExpressApp.session;
        if (session.user)
            return Result.fail("用户已登录");
        let user = await this.db.findOne({ table: "user", username })
        if (!user)
            return Result.fail("用户不存在");
        let encodedPwd = sha256(password + salt);

        if (encodedPwd != user.password)
            return Result.fail("密码错误");
        delete user.password;
        delete user.salt;
        session.user = user;
        return Result.ok(user)
    }

    /**
     * 启用用户
     * @param {string} username 
     * @returns 
     */
    async enable(username) {
        let session = ExpressApp.session;
        if (!session.user || session.user.username != "admin")
            return Result.forbid("没有权限");
        let user = await this.db.findOne({ table: "user", username })
        user.status = 1;
        await this.db.insert();
    }

    /**
     * 禁用用户
     * @param {string} username 
     * @returns 
     */
     async enable(username) {
        let session = ExpressApp.session;
        if (!session.user || session.user.username != "admin")
            return Result.forbid("没有权限");
        let user = await this.db.findOne({ table: "user", username })
        user.status = 0;
        await this.db.insert();
    }
}

export default UserService;