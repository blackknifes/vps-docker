import nedb from "nedb-promises";

class Database {
    /**@type {nedb} */
    db;

    /**
     * 初始化文件数据库
     * @param {string} filepath 
     */
    constructor(filepath) {
        this.db = nedb.create(filepath);
    }

    /**
     * 创建mapper
     * @param {string} table 表名
     */
    createMapper(table) {
        return new Mapper(this, table);
    }

    /**
     * 加载
     * @returns
     */
    async load() {
        return await this.db.load();
    }

    /**
     * 使用id获取一个对象
     * @param {string} table 
     * @param {string} id 
     * @returns 
     */
    async getById(table, id) {
        let result = await this.db.findOne({ table, id });
        if (!result)
            return result;
        delete result.table;
        return result;
    }

    /**
     * 获取一个对象
     * @param {string} table 
     * @param {object} [query] 
     * @param {object} [sortQuery] 
     * @returns 
     */
    async get(table, query, sortQuery) {
        if (typeof query !== "object")
            query = {};
        query.table = table;
        let pending = this.db.findOne(query);
        if (typeof sortQuery === "object")
            pending.sort(sortQuery);

        let result = await pending;
        if (!result)
            return result;
        delete result.table;
        return result;
    }

    /**
     * 获取所有符合条件的数据
     * @param {string} table 
     * @param {object} [query] 
     * @param {object} [sortQuery] 
     * @returns 
     */
    async list(table, query, sortQuery) {
        if (typeof query !== "object")
            query = {};
        query.table = table;
        let pended = this.db.find(query);
        if (typeof sortQuery === "object")
            pended = pended.sort(sortQuery);
        let results = await pending;
        if (!results)
            return results;
        results.map(function (result) {
            delete result.table;
        });
        return results;
    }

    /**
     * 插入数据
     * @param {string} table 
     * @param {object} data 
     * @returns 
     */
    async insert(table, data) {
        if (typeof data !== "object")
            throw "参数错误： data不能为空";
        data.table = table;
        return await this.db.insert(data);
    }

    /**
     * 更新数据
     * @param {string} table 
     * @param {object} query 
     * @param {object} updater 
     */
    async update(table, query, updater) {
        if (typeof query !== "object")
            throw "query cannot be " + query;
        if (typeof updater !== "object")
            throw "updater cannot be " + query;
        query.table = table;
        return await this.db.update(query, updater);
    }

    /**
     * 删除数据
     * @param {string} table 
     * @param {object} query 
     */
    async delete(table, query) {
        if (typeof query !== "object")
            query = {};
        query.table = table;
        return await this.db.remove(query, { multi: true });
    }

    /**
     * 获取行数
     * @param {string} table 
     * @param {object} [query] 
     */
    async count(table, query) {
        if (typeof query !== "object")
            query = {};
        query.table = table;
        return await this.db.count(query);
    }
}

class Mapper {
    /**@type {Database} */
    db;

    /**@type {string} */
    table;

    /**
     * 构造Mapper
     * @param {Database} db 
     * @param {string} table 
     */
    constructor(db, table) {
        this.db = db;
        this.table = table;
    }



    /**
     * 使用id获取一个对象
     * @param {string} id 
     * @returns 
     */
    async getById(id) {
        return await this.db.getById(this.table, { id });
    }

    /**
     * 获取一个对象
     * @param {object} [query] 
     * @param {object} [sortQuery] 
     * @returns 
     */
    async get(query, sortQuery) {
        return await this.db.get(this.table, query, sortQuery);
    }

    /**
     * 获取所有符合条件的数据
     * @param {object} [query] 
     * @param {object} [sortQuery] 
     * @returns 
     */
    async list(query, sortQuery) {
        return await this.db.list(this.table, query, sortQuery);
    }

    /**
     * 插入数据
     * @param {object} data 
     * @returns 
     */
    async insert(data) {
        return await this.db.insert(this.table, data);
    }

    /**
     * 更新数据
     * @param {object} query 
     * @param {object} updater 
     */
    async update(query, updater) {
        return await this.db.update(this.table, query, updater);
    }

    /**
     * 删除数据
     * @param {object} query 
     */
    async delete(query) {
        return await this.db.delete(this.table, query);
    }

    /**
     * 获取行数
     * @param {object} [query] 
     */
    async count(query) {
        return await this.db.count(this.table, query);
    }
}

Database.Mapper = Mapper;

export default Database;