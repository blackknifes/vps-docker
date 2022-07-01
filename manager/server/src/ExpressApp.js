import express, { Express, Request, Response } from "express";
import Result from "./Result";
import process from "process";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";

function makeSessoinId() {
    let buf = Buffer.allocUnsafe(16);
    buf.writeUInt32LE(process.pid % 4294967295, 0);
    buf.writeDoubleLE(new Date().getTime(), 4);
    buf.writeUInt32LE(parseInt(Math.random() * 4294967295), 12)
    return buf.toString("hex");
}

/**
 * @typedef {(this: ExpressApp, param: {request: Request, response: Response, params: any, body: any, session: {} })=>Result | void} HttpHandler
 */

/**
 * 
 * @this {ExpressApp}
 * @param {HttpHandler} cb
 * @param {Request} request
 * @param {Response} response
 */
async function callback(cb, request, response) {
    let sessionId = request.cookies ? request.cookies.JSESSIONID : undefined;
    let session;
    let now = new Date().getTime();
    if (sessionId) {
        session = this.sessions[sessionId];
        if (session) {
            if (parseInt((now - session.lastAccessTime) / 1000) >= this.maxInactiveInterval) {
                delete this.sessions[sessionId];
                session = undefined;
            }
            else
                session.lastAccessTime = new Date().getTime();
        }
    }
    if (!session) {
        sessionId = makeSessoinId();
        session = this.sessions[sessionId] = {
            id: sessionId,
            lastAccessTime: now,
            createdTime: now
        };
        response.cookie("JSESSIONID", sessionId);
    }

    let result;
    try {
        ExpressApp.session = session;
        ExpressApp.request = request;
        ExpressApp.response = response;

        result = cb({
            request,
            response,
            session,
            params: request.params ? request.params : {},
            body: request.body ? request.body : {},
            headers: request.headers
        });
        ExpressApp.session = null;
        ExpressApp.request = null;
        ExpressApp.response = null;
        if (result instanceof Promise)
            result = await result;
    } catch (err) {
        if (err instanceof Result)
            result = err;
        else
            result = new Result({ httpCode: 500, message: "未知错误" });
    }

    if (result) {
        if (result.stream) {
            response.status(200);
            result.stream.pipe(response);
        }
        else if (result.httpCode)
            response.status(result.httpCode).send(result.message);
        else
            response.status(200).send(JSON.stringify(result));
    }
    else
        response.sendStatus(200);
}

class ExpressApp {
    /**@type {Express} */
    app;

    /**@type {Object} */
    sessions = {};

    /**@type {number} */
    maxInactiveInterval = 30 * 1000;

    constructor() {
        this.app = express();
        this.app.use(cookieParser());
        this.app.use(bodyParser.urlencoded({ extended: false }));
        this.app.use(bodyParser.json());
    }

    /**
     * get请求
     * @param {string} url 
     * @param {HttpHandler} cb 
     */
    get(url, cb) {
        this.app.get(url, callback.bind(this, cb));
    }

    /**
     * post请求
     * @param {string} url 
     * @param {HttpHandler} cb 
     */
    post(url, cb) {
        this.app.post(url, callback.bind(this, cb));
    }

    /**
     * put请求
     * @param {string} url 
     * @param {HttpHandler} cb 
     */
    put(url, cb) {
        this.app.put(url, callback.bind(this, cb));
    }

    /**
     * delete请求
     * @param {string} url 
     * @param {HttpHandler} cb 
     */
    delete(url, cb) {
        this.app.delete(url, callback.bind(this, cb));
    }

    /**
     * options请求
     * @param {string} url 
     * @param {HttpHandler} cb 
     */
    options(url, cb) {
        this.app.options(url, callback.bind(this, cb));
    }

    /**
     * 开始监听
     * @param {number} [port] 监听端口
     */
    async listen(port) {
        return new Promise((resolve) => {
            this.app.listen(port, () => {
                resolve();
            });
        });
    }
}

/**@type {Object} */
ExpressApp.session = null;
/**@type {Request} */
ExpressApp.request = null;
/**@type {Response} */
ExpressApp.response = null;

export default ExpressApp;