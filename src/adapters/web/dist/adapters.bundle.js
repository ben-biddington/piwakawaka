(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["adapters"] = factory();
	else
		root["adapters"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/adapters/adapters.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/adapters/adapters.js":
/*!**********************************!*\
  !*** ./src/adapters/adapters.js ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("const { Storage : LocalStorage } = __webpack_require__(/*! ../adapters/local/storage */ \"./src/adapters/local/storage.js\");\r\nconst { realTime } = __webpack_require__(/*! ../adapters/metlink */ \"./src/adapters/metlink.js\");\r\n\r\nconst log = m => console.log(`[LOG.ADAPTER] ${m}`);\r\nconst newLocalStorage = () => new LocalStorage();\r\n\r\nmodule.exports = { log, newLocalStorage, realTime }\r\n\n\n//# sourceURL=webpack://adapters/./src/adapters/adapters.js?");

/***/ }),

/***/ "./src/adapters/local/storage.js":
/*!***************************************!*\
  !*** ./src/adapters/local/storage.js ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("class Storage {\r\n  constructor() {\r\n    this._storage = window.localStorage;\r\n  }\r\n\r\n  save(key, what) {\r\n    this._storage.setItem(key, JSON.stringify(what));\r\n  }\r\n\r\n  get(key) {\r\n    return JSON.parse(this._storage.getItem(key));\r\n  }\r\n\r\n  clear() {\r\n    return this._storage.clear();\r\n  }\r\n}\r\n\r\nmodule.exports.Storage = Storage;\n\n//# sourceURL=webpack://adapters/./src/adapters/local/storage.js?");

/***/ }),

/***/ "./src/adapters/metlink.js":
/*!*********************************!*\
  !*** ./src/adapters/metlink.js ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("const realTime = async (ports = {}, opts = {}) => { \r\n  const { get, log = _ => {} } = ports;\r\n  const { baseUrl = 'https://www.metlink.org.nz/api/v1/StopDepartures', stopNumber, enableDebug = false } = opts;\r\n  let { routeNumbers, routeNumber } = opts;\r\n\r\n  routeNumbers = routeNumbers || routeNumber || []; \r\n\r\n  if (routeNumbers && false === Array.isArray(routeNumbers))\r\n    routeNumbers = [routeNumbers];\r\n\r\n  const debug = enableDebug === true ? m => log(`[DEBUG] ${m}`) : _ => {};\r\n\r\n  if (!get)\r\n    throw \"You need to supply ports with a `get` function\";\r\n\r\n  if (!stopNumber)\r\n    throw \"You need to supply options with `stopNumber`\";\r\n\r\n  const url  = `${baseUrl}/${stopNumber}`;\r\n\r\n  debug(`URL: ${url}, routeNumbers: ${routeNumbers}`);\r\n\r\n  const parse = (text) => {\r\n    try {\r\n      return JSON.parse(text);\r\n    } catch (error) {\r\n      throw `Failed to parse this text to json:\\n\\n${JSON.stringify(text)}`;\r\n    }\r\n  }\r\n\r\n  const reply = await get(url, {}).\r\n    then(reply => { debug(`Raw reply:\\n${JSON.stringify(reply)}`); return reply; }).\r\n    then(reply => parse(reply));\r\n\r\n  debug(`Full reply from <${url}>:\\n${JSON.stringify(reply, null, 2)}`)\r\n\r\n  const arrivals = reply.Services.\r\n    filter(service => routeNumbers.length > 0 ? routeNumbers.indexOf(service.Service.Code) > -1 : true ).\r\n    map(   service => ( \r\n      { \r\n        code:               service.Service.Code,\r\n        destination:        service.DestinationStopName,\r\n        aimedArrival:       new Date(service.AimedArrival),\r\n        aimedDeparture:     new Date(service.AimedArrival),\r\n        departureInSeconds: service.DisplayDepartureSeconds,\r\n        destination:        service.DestinationStopName\r\n      }));\r\n\r\n  return { stop: { name: reply.Stop.Name, sms: reply.Stop.Sms}, arrivals };\r\n}\r\n\r\nmodule.exports.realTime = realTime;\n\n//# sourceURL=webpack://adapters/./src/adapters/metlink.js?");

/***/ })

/******/ });
});