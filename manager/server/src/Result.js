

class Result {
    /**
     * 构造结果
     * @param {{code?: number, httpCode?: number, stream?: NodeJS.ReadableStream, message?: string, result?: any}} options 
     */
    constructor(options) {
        if (typeof options.httpCode !== "undefined") {
            this.httpCode = options.httpCode;
            this.message = options.message;
        }
        else if (!options.code || options.code == 0) {
            this.ok = true;
            this.code = 0;
            this.result = options.result;
            this.stream = options.stream;
        }
        else {
            this.ok = false;
            this.code = options.code;
            this.message = options.message;
        }
    }

    toJson() {
        return JSON.stringify(this);
    }
}

/**
 * 成功回调
 * @param {any} result 
 * @returns 
 */
Result.ok = function (result) {
    return new Result({ result });
};

/**
 * 失败回调
 * @param {number} [code] 
 * @param {string} [message] 
 */
Result.fail = function (code, message) {
    if (typeof code == "number")
        return new Result({ code, message });
    else if (typeof code === "string")
        return new Result({ code: -1000, message: code });
    return new Result({ code: -1000, message: "未知错误" });
}

/**
 * 返回403错误
 * @param {string} message 
 * @returns 
 */
Result.forbid = function (message) {
    return new Result({ httpCode: 403, message });
}
export default Result;