import Database from "./Database";
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
    /**@type {Database.Mapper} */
    db;

    /**
     * 
     * @param {Database} db 
     */
    constructor(db) {
        this.db = db.createMapper("user");
        (async () => {
            let user = await this.db.get({ username: "admin" });
            if (!user) {
                user = { username: "admin" };
                user.salt = genSalt();
                user.password = sha256("admin" + user.salt);
                user.realname = "管理员";
                user.status = 1;
                await this.db.insert(user);
            }
        })();
    }

    /**
     * 
     * @param {{username: string, password: string, realname: string, phone?: string, sex?: number, email?: string}} user 
     */
    async register(user) {
        let session = ExpressApp.session;
        if (!user.username || user.username.length > 16)
            return Result.fail("username参数格式错误");
        if (!user.password || user.password.length > 16)
            return Result.fail("password参数格式错误");
        if (!user.realname || user.realname.length > 16)
            return Result.fail("realname参数格式错误");
        if (user.phone && !/^(\+\d\d)?[1-9]\d{10}$/g.test(user.phone))
            return Result.fail("phone参数格式错误");

        let userDb = await this.db.get({ username: user.username })
        if (userDb)
            return Result.fail("用户名已存在");
        user.table = "user";
        user.salt = genSalt();
        user.password = sha256(user.password + user.salt);
        user.status = 1;
        await this.db.insert(user);
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
    async login(username, password) {
        let session = ExpressApp.session;
        if (session.user)
            return Result.fail("用户已登录");
        let user = await this.db.get({ username })
        if (!user)
            return Result.fail("用户不存在");
        if (user.status === 0)
            return Result.fail("该用户已被禁用");

        let encodedPwd = sha256(password + user.salt);
        if (encodedPwd != user.password)
            return Result.fail("密码错误");

        user.id = user._id;
        delete user.password;
        delete user.salt;
        delete user._id;

        session.user = user;
        return Result.ok(user)
    }

    /**
     * 启用用户
     * @param {{username: string, password?: string, realname?: string, phone?: string, sex?: number, email?: string, status?: number}} user 
     * @returns 
     */
    async update(user) {
        let session = ExpressApp.session;
        if (!session.user || (session.user.username != "admin" && session.user.username != user.username))
            return Result.forbid("没有权限");

        let query = { username: user.username };
        let updater = {};
        if (user.password) {
            let userDB = await this.db.get({ username: user.username })
            if (!userDB)
                return Result.fail("该用户不存在");
            updater.password = sha256(user.password + userDB.salt);
        }
        if (user.realname)
            updater.realname = user.realname;
        if (user.phone)
            updater.phone = user.phone;
        if (user.sex)
            updater.sex = user.sex;
        if (user.email)
            updater.email = user.email;
        if (typeof user.status !== "undefined")
            updater.status = user.status;
        let num = await this.db.update(query, { $set: updater });
        if (num == 0)
            return Result.fail("用户不存在");
    }
}

export default UserService;