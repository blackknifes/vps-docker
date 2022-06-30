/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/ExpressApp.js":
/*!***************************!*\
  !*** ./src/ExpressApp.js ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! express */ "express");
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(express__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _Result__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Result */ "./src/Result.js");
/* harmony import */ var process__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! process */ "process");
/* harmony import */ var process__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(process__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var cookie_parser__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! cookie-parser */ "./node_modules/cookie-parser/index.js");
/* harmony import */ var cookie_parser__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(cookie_parser__WEBPACK_IMPORTED_MODULE_3__);





function makeSessoinId() {
  let buf = Buffer.allocUnsafe(16);
  buf.writeUInt32LE((process__WEBPACK_IMPORTED_MODULE_2___default().pid) % 4294967295, 0);
  buf.writeDoubleLE(new Date().getTime(), 4);
  buf.writeUInt32LE(parseInt(Math.random() * 4294967295), 12);
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
      } else session.lastAccessTime = new Date().getTime();
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
    if (result instanceof Promise) result = await result;
  } catch (err) {
    if (err instanceof _Result__WEBPACK_IMPORTED_MODULE_1__["default"]) result = err;else result = new _Result__WEBPACK_IMPORTED_MODULE_1__["default"]({
      httpCode: 500,
      message: "未知错误"
    });
  }

  if (result) {
    if (result.stream) {
      response.status(200);
      result.stream.pipe(response);
    } else if (result.httpCode) response.status(result.httpCode).send(result.message);else response.status(200).send(JSON.stringify(result));
  } else response.sendStatus(200);
}

class ExpressApp {
  /**@type {Express} */
  app;
  /**@type {Object} */

  sessions = {};
  /**@type {number} */

  maxInactiveInterval = 30 * 1000;

  constructor() {
    this.app = express__WEBPACK_IMPORTED_MODULE_0___default()();
    this.app.use(cookie_parser__WEBPACK_IMPORTED_MODULE_3___default()());
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
    this.app.get(url, callback.bind(this, cb));
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
    return new Promise(resolve => {
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
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ExpressApp);

/***/ }),

/***/ "./src/Result.js":
/*!***********************!*\
  !*** ./src/Result.js ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
class Result {
  /**
   * 构造结果
   * @param {{code?: number, httpCode?: number, stream?: NodeJS.ReadableStream, message?: string, result?: any}} options 
   */
  constructor(options) {
    if (typeof options.httpCode !== "undefined") {
      this.httpCode = options.httpCode;
      this.message = options.message;
    } else if (!options.code || options.code == 0) {
      this.ok = true;
      this.code = 0;
      this.result = options.result;
      this.stream = options.stream;
    } else {
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
  return new Result({
    result
  });
};
/**
 * 失败回调
 * @param {number} [code] 
 * @param {string} [message] 
 */


Result.fail = function (code, message) {
  if (typeof code == "number") return new Result({
    code,
    message
  });else if (typeof code === "string") return new Result({
    code: -1000,
    message: code
  });
  return new Result({
    code: -1000,
    message: "未知错误"
  });
};
/**
 * 返回403错误
 * @param {string} message 
 * @returns 
 */


Result.forbid = function (message) {
  return new Result({
    httpCode: 403,
    message
  });
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Result);

/***/ }),

/***/ "./src/UserService.js":
/*!****************************!*\
  !*** ./src/UserService.js ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var nedb_promises__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! nedb-promises */ "nedb-promises");
/* harmony import */ var nedb_promises__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(nedb_promises__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var crypto__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! crypto */ "crypto");
/* harmony import */ var crypto__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(crypto__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _ExpressApp__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./ExpressApp */ "./src/ExpressApp.js");
/* harmony import */ var _Result__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Result */ "./src/Result.js");





function sha256(value) {
  let digest = crypto__WEBPACK_IMPORTED_MODULE_1___default().createHash("sha256");
  return digest.update(value).digest().toString("hex");
}

function genSalt() {
  let salt = "";
  let hexs = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', '_', '~', '=', '+'];

  for (let i = 0; i < 16; i++) salt += hexs[parseInt(Math.random() * hexs.length)];

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
    let session = _ExpressApp__WEBPACK_IMPORTED_MODULE_2__["default"].session;
    if (!user.username || user.username.length > 16) return _Result__WEBPACK_IMPORTED_MODULE_3__["default"].fail("username参数格式错误");
    if (!user.password || user.password.length > 16) return _Result__WEBPACK_IMPORTED_MODULE_3__["default"].fail("password参数格式错误");
    if (!user.realname || user.realname.length > 16) return _Result__WEBPACK_IMPORTED_MODULE_3__["default"].fail("realname参数格式错误");
    if (!user.realname || !/$[1-9][0-9]{10}/g.test(user.phone)) return _Result__WEBPACK_IMPORTED_MODULE_3__["default"].fail("phone参数格式错误");
    let userDb = await this.db.findOne({
      table: "user",
      username
    });
    if (userDb) return _Result__WEBPACK_IMPORTED_MODULE_3__["default"].fail("用户名已存在");
    user.table = "user";
    user.salt = genSalt();
    user.password = sha256(user.password + user.salt);
    await this.db.insert(user);
    user.status = true;
    session.user = user;
    return _Result__WEBPACK_IMPORTED_MODULE_3__["default"].ok();
  }
  /**
   * 登录
   * @param {string} username 
   * @param {string} password 
   * @param {string} salt 
   * @returns 
   */


  async login(username, password, salt) {
    let session = _ExpressApp__WEBPACK_IMPORTED_MODULE_2__["default"].session;
    if (session.user) return _Result__WEBPACK_IMPORTED_MODULE_3__["default"].fail("用户已登录");
    let user = await this.db.findOne({
      table: "user",
      username
    });
    if (!user) return _Result__WEBPACK_IMPORTED_MODULE_3__["default"].fail("用户不存在");
    let encodedPwd = sha256(password + salt);
    if (encodedPwd != user.password) return _Result__WEBPACK_IMPORTED_MODULE_3__["default"].fail("密码错误");
    delete user.password;
    delete user.salt;
    session.user = user;
    return _Result__WEBPACK_IMPORTED_MODULE_3__["default"].ok(user);
  }
  /**
   * 启用用户
   * @param {string} username 
   * @returns 
   */


  async enable(username) {
    let session = _ExpressApp__WEBPACK_IMPORTED_MODULE_2__["default"].session;
    if (!session.user || session.user.username != "admin") return _Result__WEBPACK_IMPORTED_MODULE_3__["default"].forbid("没有权限");
    let user = await this.db.findOne({
      table: "user",
      username
    });
    user.status = 1;
    await this.db.insert();
  }
  /**
   * 禁用用户
   * @param {string} username 
   * @returns 
   */


  async enable(username) {
    let session = _ExpressApp__WEBPACK_IMPORTED_MODULE_2__["default"].session;
    if (!session.user || session.user.username != "admin") return _Result__WEBPACK_IMPORTED_MODULE_3__["default"].forbid("没有权限");
    let user = await this.db.findOne({
      table: "user",
      username
    });
    user.status = 0;
    await this.db.insert();
  }

}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (UserService);

/***/ }),

/***/ "./node_modules/cookie-parser/index.js":
/*!*********************************************!*\
  !*** ./node_modules/cookie-parser/index.js ***!
  \*********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/*!
 * cookie-parser
 * Copyright(c) 2014 TJ Holowaychuk
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */



/**
 * Module dependencies.
 * @private
 */

var cookie = __webpack_require__(/*! cookie */ "cookie")
var signature = __webpack_require__(/*! cookie-signature */ "cookie-signature")

/**
 * Module exports.
 * @public
 */

module.exports = cookieParser
module.exports.JSONCookie = JSONCookie
module.exports.JSONCookies = JSONCookies
module.exports.signedCookie = signedCookie
module.exports.signedCookies = signedCookies

/**
 * Parse Cookie header and populate `req.cookies`
 * with an object keyed by the cookie names.
 *
 * @param {string|array} [secret] A string (or array of strings) representing cookie signing secret(s).
 * @param {Object} [options]
 * @return {Function}
 * @public
 */

function cookieParser (secret, options) {
  var secrets = !secret || Array.isArray(secret)
    ? (secret || [])
    : [secret]

  return function cookieParser (req, res, next) {
    if (req.cookies) {
      return next()
    }

    var cookies = req.headers.cookie

    req.secret = secrets[0]
    req.cookies = Object.create(null)
    req.signedCookies = Object.create(null)

    // no cookies
    if (!cookies) {
      return next()
    }

    req.cookies = cookie.parse(cookies, options)

    // parse signed cookies
    if (secrets.length !== 0) {
      req.signedCookies = signedCookies(req.cookies, secrets)
      req.signedCookies = JSONCookies(req.signedCookies)
    }

    // parse JSON cookies
    req.cookies = JSONCookies(req.cookies)

    next()
  }
}

/**
 * Parse JSON cookie string.
 *
 * @param {String} str
 * @return {Object} Parsed object or undefined if not json cookie
 * @public
 */

function JSONCookie (str) {
  if (typeof str !== 'string' || str.substr(0, 2) !== 'j:') {
    return undefined
  }

  try {
    return JSON.parse(str.slice(2))
  } catch (err) {
    return undefined
  }
}

/**
 * Parse JSON cookies.
 *
 * @param {Object} obj
 * @return {Object}
 * @public
 */

function JSONCookies (obj) {
  var cookies = Object.keys(obj)
  var key
  var val

  for (var i = 0; i < cookies.length; i++) {
    key = cookies[i]
    val = JSONCookie(obj[key])

    if (val) {
      obj[key] = val
    }
  }

  return obj
}

/**
 * Parse a signed cookie string, return the decoded value.
 *
 * @param {String} str signed cookie string
 * @param {string|array} secret
 * @return {String} decoded value
 * @public
 */

function signedCookie (str, secret) {
  if (typeof str !== 'string') {
    return undefined
  }

  if (str.substr(0, 2) !== 's:') {
    return str
  }

  var secrets = !secret || Array.isArray(secret)
    ? (secret || [])
    : [secret]

  for (var i = 0; i < secrets.length; i++) {
    var val = signature.unsign(str.slice(2), secrets[i])

    if (val !== false) {
      return val
    }
  }

  return false
}

/**
 * Parse signed cookies, returning an object containing the decoded key/value
 * pairs, while removing the signed key from obj.
 *
 * @param {Object} obj
 * @param {string|array} secret
 * @return {Object}
 * @public
 */

function signedCookies (obj, secret) {
  var cookies = Object.keys(obj)
  var dec
  var key
  var ret = Object.create(null)
  var val

  for (var i = 0; i < cookies.length; i++) {
    key = cookies[i]
    val = obj[key]
    dec = signedCookie(val, secret)

    if (val !== dec) {
      ret[key] = dec
      delete obj[key]
    }
  }

  return ret
}


/***/ }),

/***/ "cookie":
/*!*************************!*\
  !*** external "cookie" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("cookie");

/***/ }),

/***/ "cookie-signature":
/*!***********************************!*\
  !*** external "cookie-signature" ***!
  \***********************************/
/***/ ((module) => {

module.exports = require("cookie-signature");

/***/ }),

/***/ "express":
/*!**************************!*\
  !*** external "express" ***!
  \**************************/
/***/ ((module) => {

module.exports = require("express");

/***/ }),

/***/ "nedb-promises":
/*!********************************!*\
  !*** external "nedb-promises" ***!
  \********************************/
/***/ ((module) => {

module.exports = require("nedb-promises");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("crypto");

/***/ }),

/***/ "process":
/*!**************************!*\
  !*** external "process" ***!
  \**************************/
/***/ ((module) => {

module.exports = require("process");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var nedb_promises__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! nedb-promises */ "nedb-promises");
/* harmony import */ var nedb_promises__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(nedb_promises__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _ExpressApp__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ExpressApp */ "./src/ExpressApp.js");
/* harmony import */ var _UserService__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./UserService */ "./src/UserService.js");




(async function () {
  let db = nedb_promises__WEBPACK_IMPORTED_MODULE_0___default().create("D:/upload/test.db");
  await db.load();
  const app = new _ExpressApp__WEBPACK_IMPORTED_MODULE_1__["default"]();
  let userService = new _UserService__WEBPACK_IMPORTED_MODULE_2__["default"](db);
  app.get("/register", function ({
    request,
    response,
    params,
    body
  }) {
    return userService.register(body);
  });
  app.post("/login", function ({
    params
  }) {
    return userService.login(params);
  });
  await app.listen(80);
})();
})();

/******/ })()
;
//# sourceMappingURL=main.js.map