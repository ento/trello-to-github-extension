/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _background = __webpack_require__(1);

	(0, _background.init)();

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.init = init;

	var _constants = __webpack_require__(2);

	var _constants2 = _interopRequireDefault(_constants);

	var _messages = __webpack_require__(3);

	var _messages2 = _interopRequireDefault(_messages);

	var _githubOauth = __webpack_require__(4);

	var GitHubOAuth = _interopRequireWildcard(_githubOauth);

	var _githubClient = __webpack_require__(5);

	var _githubClient2 = _interopRequireDefault(_githubClient);

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var githubParams = {
	  'clientId': 'b5a70bd8168d50346752',
	  'clientSecret': '3793c48f7b1a8056a19272e687c9e669df9fafe0',
	  'scope': 'repo'
	};

	chrome.runtime.onMessage.addListener(handleMessage);

	function handleMessage(request, sender, sendResponse) {
	  var handler = messageHandlers[request.kind];
	  if (handler) {
	    handler(request, sender, sendResponse);
	  }
	}

	var messageHandlers = {};
	messageHandlers[_messages2.default.GITHUB_LOGIN] = function (request, sender, sendResponse) {
	  GitHubOAuth.getToken(true, githubParams, function (error, token) {
	    _githubClient2.default.setToken(token);
	    sendGithubState(error, sendResponse);
	  });
	};
	messageHandlers[_messages2.default.GITHUB_LOGOUT] = function (request, sender, sendResponse) {
	  GitHubOAuth.removeCachedToken(githubAccessToken);
	  _githubClient2.default.setToken(null);
	  sendGithubState(null, sendResponse);
	};
	messageHandlers[_messages2.default.GITHUB_STATE] = function (request, sender, sendResponse) {
	  sendGithubState(null, sendResponse);
	};

	function sendGithubState(error, sendResponse) {
	  var message = {
	    kind: _messages2.default.GITHUB_STATE,
	    authorized: _githubClient2.default.hasCredentials(),
	    error: error
	  };
	  if (message.authorized) {}
	  sendResponse(message);
	}

	function isAuthorized() {
	  !!(localStorage.trello_token && _githubClient2.default.hasCredentials());
	}

	function createUnauthorizedMenu() {
	  chrome.contextMenus.create({
	    "id": "root",
	    "title": "Authorize Trello and GitHub",
	    "contexts": ["page"],
	    "onclick": function onclick(info, tab) {
	      console.log(info, tab);
	    }
	  });
	}

	function createAuthorizedMenu() {
	  chrome.contextMenus.create({
	    "id": "root",
	    "title": "Create GitHub Issue",
	    "contexts": ["page"],
	    "onclick": function onclick(info, tab) {
	      console.log(info, tab);
	    }
	  });
	}

	function init() {
	  if (isAuthorized()) {
	    createAuthorizedMenu();
	  } else {
	    createUnauthorizedMenu();
	  }
	}

/***/ },
/* 2 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = {
	  TRELLO_KEY: 'f5156cc7e64a8fd75e20997824076722',
	  APP_NAME: "Trello to GitHub Extension"
	};

/***/ },
/* 3 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = {
	  'GITHUB_LOGIN': 'github_login',
	  'GITHUB_LOGOUT': 'github_logout',
	  'GITHUB_STATE': 'github_state'
	};

/***/ },
/* 4 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.getToken = getToken;
	exports.removeCachedToken = removeCachedToken;
	var redirectUri = chrome.identity.getRedirectURL('github_callback');
	var redirectRe = new RegExp(redirectUri + '[#\?](.*)');

	var access_token = null;

	function getToken(interactive, params, callback) {
	  // In case we already have an access_token cached, simply return it.
	  if (access_token) {
	    callback(null, access_token);
	    return;
	  }

	  var options = {
	    'interactive': interactive,
	    'url': 'https://github.com/login/oauth/authorize' + '?client_id=' + params.clientId + '&redirect_uri=' + encodeURIComponent(redirectUri) + '&scope=' + params.scope
	  };
	  chrome.identity.launchWebAuthFlow(options, function (redirectUri) {
	    if (chrome.runtime.lastError) {
	      callback(new Error(chrome.runtime.lastError));
	      return;
	    }

	    // Upon success the response is appended to redirectUri, e.g.
	    // https://{app_id}.chromiumapp.org/provider_cb#access_token={value}
	    //     &refresh_token={value}
	    // or:
	    // https://{app_id}.chromiumapp.org/provider_cb#code={value}
	    var matches = redirectUri.match(redirectRe);
	    if (matches && matches.length > 1) handleProviderResponse(parseRedirectFragment(matches[1]));else callback(new Error('Invalid redirect URI'));
	  });

	  function parseRedirectFragment(fragment) {
	    var pairs = fragment.split(/&/);
	    var values = {};

	    pairs.forEach(function (pair) {
	      var nameval = pair.split(/=/);
	      values[nameval[0]] = nameval[1];
	    });

	    return values;
	  }

	  function handleProviderResponse(values) {
	    if (values.hasOwnProperty('access_token')) setAccessToken(values.access_token);
	    // If response does not have an access_token, it might have the code,
	    // which can be used in exchange for token.
	    else if (values.hasOwnProperty('code')) exchangeCodeForToken(values.code);else callback(new Error('Neither access_token nor code avialable.'));
	  }

	  function exchangeCodeForToken(code) {
	    var xhr = new XMLHttpRequest();
	    xhr.open('GET', 'https://github.com/login/oauth/access_token?' + 'client_id=' + params.clientId + '&client_secret=' + params.clientSecret + '&redirect_uri=' + redirectUri + '&code=' + code);
	    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	    xhr.setRequestHeader('Accept', 'application/json');
	    xhr.onload = function () {
	      // When exchanging code for token, the response comes as json, which
	      // can be easily parsed to an object.
	      if (this.status === 200) {
	        var response = JSON.parse(this.responseText);
	        if (response.hasOwnProperty('access_token')) {
	          setAccessToken(response.access_token);
	        } else {
	          callback(new Error('Cannot obtain access_token from code.'));
	        }
	      } else {
	        callback(new Error('Code exchange failed'));
	      }
	    };
	    xhr.send();
	  }

	  function setAccessToken(token) {
	    access_token = token;
	    callback(null, access_token);
	  }
	}

	function removeCachedToken(token_to_remove) {
	  if (access_token == token_to_remove) access_token = null;
	}

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); // https://github.com/philschatz/gh-board/blob/master/src/github-client.js

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _underscore = __webpack_require__(6);

	var _underscore2 = _interopRequireDefault(_underscore);

	var _events = __webpack_require__(7);

	var _events2 = _interopRequireDefault(_events);

	var _base = __webpack_require__(8);

	var _base2 = _interopRequireDefault(_base);

	var _simpleVerbs = __webpack_require__(17);

	var _simpleVerbs2 = _interopRequireDefault(_simpleVerbs);

	var _nativeOnly = __webpack_require__(18);

	var _nativeOnly2 = _interopRequireDefault(_nativeOnly);

	var _authorization = __webpack_require__(23);

	var _authorization2 = _interopRequireDefault(_authorization);

	var _camelCase = __webpack_require__(25);

	var _camelCase2 = _interopRequireDefault(_camelCase);

	var _cacheHandler = __webpack_require__(26);

	var _cacheHandler2 = _interopRequireDefault(_cacheHandler);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var MAX_CACHED_URLS = 2000;

	var cachedClient = null;

	var cacheHandler = new (function () {
	  function CacheHandler() {
	    _classCallCheck(this, CacheHandler);

	    // Pull data from `localStorage`
	    this.storage = window.localStorage;
	    var cache = this.storage.getItem('octokat-cache');
	    if (cache) {
	      this.cachedETags = JSON.parse(cache);
	    } else {
	      this.cachedETags = {};
	    }
	    // Async save once now new JSON has been fetched after X seconds
	    this.pendingTimeout = null;
	  }

	  _createClass(CacheHandler, [{
	    key: '_dumpCache',
	    value: function _dumpCache() {
	      console.log('github-client: Dumping localStorage cache because it is too big');
	      this.storage.removeItem('octokat-cache');
	    }
	  }, {
	    key: 'get',
	    value: function get(method, path) {
	      var ret = this.cachedETags[method + ' ' + path];
	      if (ret) {
	        (function () {
	          var data = ret.data;
	          var linkRelations = ret.linkRelations;

	          _underscore2.default.each(linkRelations, function (value, key) {
	            if (value) {
	              data[key] = value;
	            }
	          });
	        })();
	      }
	      return ret;
	    }
	  }, {
	    key: 'add',
	    value: function add(method, path, eTag, data, status) {
	      var _this = this;

	      var linkRelations = {};
	      // if data is an array, it contains additional link relations (to other pages)
	      if (_underscore2.default.isArray(data)) {
	        _underscore2.default.each(['next', 'previous', 'first', 'last'], function (name) {
	          var key = name + '_page_url';
	          if (data[key]) {
	            linkRelations[key] = data[key];
	          }
	        });
	      }

	      if (status !== 403) {
	        // do not cache if you do not have permissions
	        this.cachedETags[method + ' ' + path] = { eTag: eTag, data: data, status: status, linkRelations: linkRelations };
	        if (Object.keys(this.cachedETags).length > MAX_CACHED_URLS) {
	          // stop saving. blow the storage cache because
	          // stringifying JSON and saving is slow
	          this._dumpCache();
	        } else {
	          if (this.pendingTimeout) {
	            clearTimeout(this.pendingTimeout);
	          }
	          var saveCache = function saveCache() {
	            _this.pendingTimeout = null;
	            // If localStorage fills up, just blow it away.
	            try {
	              _this.storage.setItem('octokat-cache', JSON.stringify(_this.cachedETags));
	            } catch (e) {
	              _this.cachedETags = {};
	              _this._dumpCache();
	            }
	          };
	          this.pendingTimeout = setTimeout(saveCache, 5 * 1000);
	        }
	      }
	    }
	  }]);

	  return CacheHandler;
	}())();

	var Client = function (_EventEmitter) {
	  _inherits(Client, _EventEmitter);

	  function Client() {
	    _classCallCheck(this, Client);

	    var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(Client).call(this));

	    _this2.LOW_RATE_LIMIT = 60;
	    return _this2;
	  }

	  _createClass(Client, [{
	    key: 'off',
	    value: function off() {
	      // EventEmitter has `.on` but no matching `.off`
	      var slice = [].slice;
	      var args = arguments.length >= 1 ? slice.call(arguments, 0) : [];
	      return this.removeListener.apply(this, args);
	    }
	  }, {
	    key: 'getCredentials',
	    value: function getCredentials() {
	      return {
	        plugins: [_simpleVerbs2.default, _nativeOnly2.default, _authorization2.default, _camelCase2.default, _cacheHandler2.default],
	        token: window.localStorage.getItem('gh-token'),
	        username: window.localStorage.getItem('gh-username'),
	        password: window.localStorage.getItem('gh-password'),
	        cacheHandler: cacheHandler,
	        emitter: this.emit.bind(this)
	      };
	    }
	  }, {
	    key: 'hasCredentials',
	    value: function hasCredentials() {
	      var _getCredentials = this.getCredentials();

	      var token = _getCredentials.token;
	      var password = _getCredentials.password;

	      return !!token || !!password;
	    }
	  }, {
	    key: 'getOcto',
	    value: function getOcto() {
	      var _this3 = this;

	      if (!cachedClient) {
	        var credentials = this.getCredentials();
	        cachedClient = new _base2.default(credentials);
	        // update the rateLimit for issue-store so it can gracefully back off
	        // making requests when the rate limit is low
	        this.on('request', function (_ref) {
	          var remaining = _ref.rate.remaining;

	          _this3.rateLimitRemaining = remaining;
	        });
	      }
	      return cachedClient;
	    }
	  }, {
	    key: 'readMessage',
	    value: function readMessage() {
	      return this.getOcto().zen.read();
	    }
	  }, {
	    key: 'getRateLimitRemaining',
	    value: function getRateLimitRemaining() {
	      return this.rateLimitRemaining;
	    }
	  }, {
	    key: 'setToken',
	    value: function setToken(token) {
	      cachedClient = null;
	      if (token) {
	        window.localStorage.setItem('gh-token', token);
	      } else {
	        window.localStorage.removeItem('gh-token');
	      }
	      this.emit('changeToken');
	    }
	  }]);

	  return Client;
	}(_events2.default);

	// Singleton

	exports.default = new Client();

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;//     Underscore.js 1.8.3
	//     http://underscorejs.org
	//     (c) 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	//     Underscore may be freely distributed under the MIT license.

	(function() {

	  // Baseline setup
	  // --------------

	  // Establish the root object, `window` in the browser, or `exports` on the server.
	  var root = this;

	  // Save the previous value of the `_` variable.
	  var previousUnderscore = root._;

	  // Save bytes in the minified (but not gzipped) version:
	  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

	  // Create quick reference variables for speed access to core prototypes.
	  var
	    push             = ArrayProto.push,
	    slice            = ArrayProto.slice,
	    toString         = ObjProto.toString,
	    hasOwnProperty   = ObjProto.hasOwnProperty;

	  // All **ECMAScript 5** native function implementations that we hope to use
	  // are declared here.
	  var
	    nativeIsArray      = Array.isArray,
	    nativeKeys         = Object.keys,
	    nativeBind         = FuncProto.bind,
	    nativeCreate       = Object.create;

	  // Naked function reference for surrogate-prototype-swapping.
	  var Ctor = function(){};

	  // Create a safe reference to the Underscore object for use below.
	  var _ = function(obj) {
	    if (obj instanceof _) return obj;
	    if (!(this instanceof _)) return new _(obj);
	    this._wrapped = obj;
	  };

	  // Export the Underscore object for **Node.js**, with
	  // backwards-compatibility for the old `require()` API. If we're in
	  // the browser, add `_` as a global object.
	  if (true) {
	    if (typeof module !== 'undefined' && module.exports) {
	      exports = module.exports = _;
	    }
	    exports._ = _;
	  } else {
	    root._ = _;
	  }

	  // Current version.
	  _.VERSION = '1.8.3';

	  // Internal function that returns an efficient (for current engines) version
	  // of the passed-in callback, to be repeatedly applied in other Underscore
	  // functions.
	  var optimizeCb = function(func, context, argCount) {
	    if (context === void 0) return func;
	    switch (argCount == null ? 3 : argCount) {
	      case 1: return function(value) {
	        return func.call(context, value);
	      };
	      case 2: return function(value, other) {
	        return func.call(context, value, other);
	      };
	      case 3: return function(value, index, collection) {
	        return func.call(context, value, index, collection);
	      };
	      case 4: return function(accumulator, value, index, collection) {
	        return func.call(context, accumulator, value, index, collection);
	      };
	    }
	    return function() {
	      return func.apply(context, arguments);
	    };
	  };

	  // A mostly-internal function to generate callbacks that can be applied
	  // to each element in a collection, returning the desired result — either
	  // identity, an arbitrary callback, a property matcher, or a property accessor.
	  var cb = function(value, context, argCount) {
	    if (value == null) return _.identity;
	    if (_.isFunction(value)) return optimizeCb(value, context, argCount);
	    if (_.isObject(value)) return _.matcher(value);
	    return _.property(value);
	  };
	  _.iteratee = function(value, context) {
	    return cb(value, context, Infinity);
	  };

	  // An internal function for creating assigner functions.
	  var createAssigner = function(keysFunc, undefinedOnly) {
	    return function(obj) {
	      var length = arguments.length;
	      if (length < 2 || obj == null) return obj;
	      for (var index = 1; index < length; index++) {
	        var source = arguments[index],
	            keys = keysFunc(source),
	            l = keys.length;
	        for (var i = 0; i < l; i++) {
	          var key = keys[i];
	          if (!undefinedOnly || obj[key] === void 0) obj[key] = source[key];
	        }
	      }
	      return obj;
	    };
	  };

	  // An internal function for creating a new object that inherits from another.
	  var baseCreate = function(prototype) {
	    if (!_.isObject(prototype)) return {};
	    if (nativeCreate) return nativeCreate(prototype);
	    Ctor.prototype = prototype;
	    var result = new Ctor;
	    Ctor.prototype = null;
	    return result;
	  };

	  var property = function(key) {
	    return function(obj) {
	      return obj == null ? void 0 : obj[key];
	    };
	  };

	  // Helper for collection methods to determine whether a collection
	  // should be iterated as an array or as an object
	  // Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
	  // Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
	  var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
	  var getLength = property('length');
	  var isArrayLike = function(collection) {
	    var length = getLength(collection);
	    return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
	  };

	  // Collection Functions
	  // --------------------

	  // The cornerstone, an `each` implementation, aka `forEach`.
	  // Handles raw objects in addition to array-likes. Treats all
	  // sparse array-likes as if they were dense.
	  _.each = _.forEach = function(obj, iteratee, context) {
	    iteratee = optimizeCb(iteratee, context);
	    var i, length;
	    if (isArrayLike(obj)) {
	      for (i = 0, length = obj.length; i < length; i++) {
	        iteratee(obj[i], i, obj);
	      }
	    } else {
	      var keys = _.keys(obj);
	      for (i = 0, length = keys.length; i < length; i++) {
	        iteratee(obj[keys[i]], keys[i], obj);
	      }
	    }
	    return obj;
	  };

	  // Return the results of applying the iteratee to each element.
	  _.map = _.collect = function(obj, iteratee, context) {
	    iteratee = cb(iteratee, context);
	    var keys = !isArrayLike(obj) && _.keys(obj),
	        length = (keys || obj).length,
	        results = Array(length);
	    for (var index = 0; index < length; index++) {
	      var currentKey = keys ? keys[index] : index;
	      results[index] = iteratee(obj[currentKey], currentKey, obj);
	    }
	    return results;
	  };

	  // Create a reducing function iterating left or right.
	  function createReduce(dir) {
	    // Optimized iterator function as using arguments.length
	    // in the main function will deoptimize the, see #1991.
	    function iterator(obj, iteratee, memo, keys, index, length) {
	      for (; index >= 0 && index < length; index += dir) {
	        var currentKey = keys ? keys[index] : index;
	        memo = iteratee(memo, obj[currentKey], currentKey, obj);
	      }
	      return memo;
	    }

	    return function(obj, iteratee, memo, context) {
	      iteratee = optimizeCb(iteratee, context, 4);
	      var keys = !isArrayLike(obj) && _.keys(obj),
	          length = (keys || obj).length,
	          index = dir > 0 ? 0 : length - 1;
	      // Determine the initial value if none is provided.
	      if (arguments.length < 3) {
	        memo = obj[keys ? keys[index] : index];
	        index += dir;
	      }
	      return iterator(obj, iteratee, memo, keys, index, length);
	    };
	  }

	  // **Reduce** builds up a single result from a list of values, aka `inject`,
	  // or `foldl`.
	  _.reduce = _.foldl = _.inject = createReduce(1);

	  // The right-associative version of reduce, also known as `foldr`.
	  _.reduceRight = _.foldr = createReduce(-1);

	  // Return the first value which passes a truth test. Aliased as `detect`.
	  _.find = _.detect = function(obj, predicate, context) {
	    var key;
	    if (isArrayLike(obj)) {
	      key = _.findIndex(obj, predicate, context);
	    } else {
	      key = _.findKey(obj, predicate, context);
	    }
	    if (key !== void 0 && key !== -1) return obj[key];
	  };

	  // Return all the elements that pass a truth test.
	  // Aliased as `select`.
	  _.filter = _.select = function(obj, predicate, context) {
	    var results = [];
	    predicate = cb(predicate, context);
	    _.each(obj, function(value, index, list) {
	      if (predicate(value, index, list)) results.push(value);
	    });
	    return results;
	  };

	  // Return all the elements for which a truth test fails.
	  _.reject = function(obj, predicate, context) {
	    return _.filter(obj, _.negate(cb(predicate)), context);
	  };

	  // Determine whether all of the elements match a truth test.
	  // Aliased as `all`.
	  _.every = _.all = function(obj, predicate, context) {
	    predicate = cb(predicate, context);
	    var keys = !isArrayLike(obj) && _.keys(obj),
	        length = (keys || obj).length;
	    for (var index = 0; index < length; index++) {
	      var currentKey = keys ? keys[index] : index;
	      if (!predicate(obj[currentKey], currentKey, obj)) return false;
	    }
	    return true;
	  };

	  // Determine if at least one element in the object matches a truth test.
	  // Aliased as `any`.
	  _.some = _.any = function(obj, predicate, context) {
	    predicate = cb(predicate, context);
	    var keys = !isArrayLike(obj) && _.keys(obj),
	        length = (keys || obj).length;
	    for (var index = 0; index < length; index++) {
	      var currentKey = keys ? keys[index] : index;
	      if (predicate(obj[currentKey], currentKey, obj)) return true;
	    }
	    return false;
	  };

	  // Determine if the array or object contains a given item (using `===`).
	  // Aliased as `includes` and `include`.
	  _.contains = _.includes = _.include = function(obj, item, fromIndex, guard) {
	    if (!isArrayLike(obj)) obj = _.values(obj);
	    if (typeof fromIndex != 'number' || guard) fromIndex = 0;
	    return _.indexOf(obj, item, fromIndex) >= 0;
	  };

	  // Invoke a method (with arguments) on every item in a collection.
	  _.invoke = function(obj, method) {
	    var args = slice.call(arguments, 2);
	    var isFunc = _.isFunction(method);
	    return _.map(obj, function(value) {
	      var func = isFunc ? method : value[method];
	      return func == null ? func : func.apply(value, args);
	    });
	  };

	  // Convenience version of a common use case of `map`: fetching a property.
	  _.pluck = function(obj, key) {
	    return _.map(obj, _.property(key));
	  };

	  // Convenience version of a common use case of `filter`: selecting only objects
	  // containing specific `key:value` pairs.
	  _.where = function(obj, attrs) {
	    return _.filter(obj, _.matcher(attrs));
	  };

	  // Convenience version of a common use case of `find`: getting the first object
	  // containing specific `key:value` pairs.
	  _.findWhere = function(obj, attrs) {
	    return _.find(obj, _.matcher(attrs));
	  };

	  // Return the maximum element (or element-based computation).
	  _.max = function(obj, iteratee, context) {
	    var result = -Infinity, lastComputed = -Infinity,
	        value, computed;
	    if (iteratee == null && obj != null) {
	      obj = isArrayLike(obj) ? obj : _.values(obj);
	      for (var i = 0, length = obj.length; i < length; i++) {
	        value = obj[i];
	        if (value > result) {
	          result = value;
	        }
	      }
	    } else {
	      iteratee = cb(iteratee, context);
	      _.each(obj, function(value, index, list) {
	        computed = iteratee(value, index, list);
	        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
	          result = value;
	          lastComputed = computed;
	        }
	      });
	    }
	    return result;
	  };

	  // Return the minimum element (or element-based computation).
	  _.min = function(obj, iteratee, context) {
	    var result = Infinity, lastComputed = Infinity,
	        value, computed;
	    if (iteratee == null && obj != null) {
	      obj = isArrayLike(obj) ? obj : _.values(obj);
	      for (var i = 0, length = obj.length; i < length; i++) {
	        value = obj[i];
	        if (value < result) {
	          result = value;
	        }
	      }
	    } else {
	      iteratee = cb(iteratee, context);
	      _.each(obj, function(value, index, list) {
	        computed = iteratee(value, index, list);
	        if (computed < lastComputed || computed === Infinity && result === Infinity) {
	          result = value;
	          lastComputed = computed;
	        }
	      });
	    }
	    return result;
	  };

	  // Shuffle a collection, using the modern version of the
	  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
	  _.shuffle = function(obj) {
	    var set = isArrayLike(obj) ? obj : _.values(obj);
	    var length = set.length;
	    var shuffled = Array(length);
	    for (var index = 0, rand; index < length; index++) {
	      rand = _.random(0, index);
	      if (rand !== index) shuffled[index] = shuffled[rand];
	      shuffled[rand] = set[index];
	    }
	    return shuffled;
	  };

	  // Sample **n** random values from a collection.
	  // If **n** is not specified, returns a single random element.
	  // The internal `guard` argument allows it to work with `map`.
	  _.sample = function(obj, n, guard) {
	    if (n == null || guard) {
	      if (!isArrayLike(obj)) obj = _.values(obj);
	      return obj[_.random(obj.length - 1)];
	    }
	    return _.shuffle(obj).slice(0, Math.max(0, n));
	  };

	  // Sort the object's values by a criterion produced by an iteratee.
	  _.sortBy = function(obj, iteratee, context) {
	    iteratee = cb(iteratee, context);
	    return _.pluck(_.map(obj, function(value, index, list) {
	      return {
	        value: value,
	        index: index,
	        criteria: iteratee(value, index, list)
	      };
	    }).sort(function(left, right) {
	      var a = left.criteria;
	      var b = right.criteria;
	      if (a !== b) {
	        if (a > b || a === void 0) return 1;
	        if (a < b || b === void 0) return -1;
	      }
	      return left.index - right.index;
	    }), 'value');
	  };

	  // An internal function used for aggregate "group by" operations.
	  var group = function(behavior) {
	    return function(obj, iteratee, context) {
	      var result = {};
	      iteratee = cb(iteratee, context);
	      _.each(obj, function(value, index) {
	        var key = iteratee(value, index, obj);
	        behavior(result, value, key);
	      });
	      return result;
	    };
	  };

	  // Groups the object's values by a criterion. Pass either a string attribute
	  // to group by, or a function that returns the criterion.
	  _.groupBy = group(function(result, value, key) {
	    if (_.has(result, key)) result[key].push(value); else result[key] = [value];
	  });

	  // Indexes the object's values by a criterion, similar to `groupBy`, but for
	  // when you know that your index values will be unique.
	  _.indexBy = group(function(result, value, key) {
	    result[key] = value;
	  });

	  // Counts instances of an object that group by a certain criterion. Pass
	  // either a string attribute to count by, or a function that returns the
	  // criterion.
	  _.countBy = group(function(result, value, key) {
	    if (_.has(result, key)) result[key]++; else result[key] = 1;
	  });

	  // Safely create a real, live array from anything iterable.
	  _.toArray = function(obj) {
	    if (!obj) return [];
	    if (_.isArray(obj)) return slice.call(obj);
	    if (isArrayLike(obj)) return _.map(obj, _.identity);
	    return _.values(obj);
	  };

	  // Return the number of elements in an object.
	  _.size = function(obj) {
	    if (obj == null) return 0;
	    return isArrayLike(obj) ? obj.length : _.keys(obj).length;
	  };

	  // Split a collection into two arrays: one whose elements all satisfy the given
	  // predicate, and one whose elements all do not satisfy the predicate.
	  _.partition = function(obj, predicate, context) {
	    predicate = cb(predicate, context);
	    var pass = [], fail = [];
	    _.each(obj, function(value, key, obj) {
	      (predicate(value, key, obj) ? pass : fail).push(value);
	    });
	    return [pass, fail];
	  };

	  // Array Functions
	  // ---------------

	  // Get the first element of an array. Passing **n** will return the first N
	  // values in the array. Aliased as `head` and `take`. The **guard** check
	  // allows it to work with `_.map`.
	  _.first = _.head = _.take = function(array, n, guard) {
	    if (array == null) return void 0;
	    if (n == null || guard) return array[0];
	    return _.initial(array, array.length - n);
	  };

	  // Returns everything but the last entry of the array. Especially useful on
	  // the arguments object. Passing **n** will return all the values in
	  // the array, excluding the last N.
	  _.initial = function(array, n, guard) {
	    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
	  };

	  // Get the last element of an array. Passing **n** will return the last N
	  // values in the array.
	  _.last = function(array, n, guard) {
	    if (array == null) return void 0;
	    if (n == null || guard) return array[array.length - 1];
	    return _.rest(array, Math.max(0, array.length - n));
	  };

	  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
	  // Especially useful on the arguments object. Passing an **n** will return
	  // the rest N values in the array.
	  _.rest = _.tail = _.drop = function(array, n, guard) {
	    return slice.call(array, n == null || guard ? 1 : n);
	  };

	  // Trim out all falsy values from an array.
	  _.compact = function(array) {
	    return _.filter(array, _.identity);
	  };

	  // Internal implementation of a recursive `flatten` function.
	  var flatten = function(input, shallow, strict, startIndex) {
	    var output = [], idx = 0;
	    for (var i = startIndex || 0, length = getLength(input); i < length; i++) {
	      var value = input[i];
	      if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
	        //flatten current level of array or arguments object
	        if (!shallow) value = flatten(value, shallow, strict);
	        var j = 0, len = value.length;
	        output.length += len;
	        while (j < len) {
	          output[idx++] = value[j++];
	        }
	      } else if (!strict) {
	        output[idx++] = value;
	      }
	    }
	    return output;
	  };

	  // Flatten out an array, either recursively (by default), or just one level.
	  _.flatten = function(array, shallow) {
	    return flatten(array, shallow, false);
	  };

	  // Return a version of the array that does not contain the specified value(s).
	  _.without = function(array) {
	    return _.difference(array, slice.call(arguments, 1));
	  };

	  // Produce a duplicate-free version of the array. If the array has already
	  // been sorted, you have the option of using a faster algorithm.
	  // Aliased as `unique`.
	  _.uniq = _.unique = function(array, isSorted, iteratee, context) {
	    if (!_.isBoolean(isSorted)) {
	      context = iteratee;
	      iteratee = isSorted;
	      isSorted = false;
	    }
	    if (iteratee != null) iteratee = cb(iteratee, context);
	    var result = [];
	    var seen = [];
	    for (var i = 0, length = getLength(array); i < length; i++) {
	      var value = array[i],
	          computed = iteratee ? iteratee(value, i, array) : value;
	      if (isSorted) {
	        if (!i || seen !== computed) result.push(value);
	        seen = computed;
	      } else if (iteratee) {
	        if (!_.contains(seen, computed)) {
	          seen.push(computed);
	          result.push(value);
	        }
	      } else if (!_.contains(result, value)) {
	        result.push(value);
	      }
	    }
	    return result;
	  };

	  // Produce an array that contains the union: each distinct element from all of
	  // the passed-in arrays.
	  _.union = function() {
	    return _.uniq(flatten(arguments, true, true));
	  };

	  // Produce an array that contains every item shared between all the
	  // passed-in arrays.
	  _.intersection = function(array) {
	    var result = [];
	    var argsLength = arguments.length;
	    for (var i = 0, length = getLength(array); i < length; i++) {
	      var item = array[i];
	      if (_.contains(result, item)) continue;
	      for (var j = 1; j < argsLength; j++) {
	        if (!_.contains(arguments[j], item)) break;
	      }
	      if (j === argsLength) result.push(item);
	    }
	    return result;
	  };

	  // Take the difference between one array and a number of other arrays.
	  // Only the elements present in just the first array will remain.
	  _.difference = function(array) {
	    var rest = flatten(arguments, true, true, 1);
	    return _.filter(array, function(value){
	      return !_.contains(rest, value);
	    });
	  };

	  // Zip together multiple lists into a single array -- elements that share
	  // an index go together.
	  _.zip = function() {
	    return _.unzip(arguments);
	  };

	  // Complement of _.zip. Unzip accepts an array of arrays and groups
	  // each array's elements on shared indices
	  _.unzip = function(array) {
	    var length = array && _.max(array, getLength).length || 0;
	    var result = Array(length);

	    for (var index = 0; index < length; index++) {
	      result[index] = _.pluck(array, index);
	    }
	    return result;
	  };

	  // Converts lists into objects. Pass either a single array of `[key, value]`
	  // pairs, or two parallel arrays of the same length -- one of keys, and one of
	  // the corresponding values.
	  _.object = function(list, values) {
	    var result = {};
	    for (var i = 0, length = getLength(list); i < length; i++) {
	      if (values) {
	        result[list[i]] = values[i];
	      } else {
	        result[list[i][0]] = list[i][1];
	      }
	    }
	    return result;
	  };

	  // Generator function to create the findIndex and findLastIndex functions
	  function createPredicateIndexFinder(dir) {
	    return function(array, predicate, context) {
	      predicate = cb(predicate, context);
	      var length = getLength(array);
	      var index = dir > 0 ? 0 : length - 1;
	      for (; index >= 0 && index < length; index += dir) {
	        if (predicate(array[index], index, array)) return index;
	      }
	      return -1;
	    };
	  }

	  // Returns the first index on an array-like that passes a predicate test
	  _.findIndex = createPredicateIndexFinder(1);
	  _.findLastIndex = createPredicateIndexFinder(-1);

	  // Use a comparator function to figure out the smallest index at which
	  // an object should be inserted so as to maintain order. Uses binary search.
	  _.sortedIndex = function(array, obj, iteratee, context) {
	    iteratee = cb(iteratee, context, 1);
	    var value = iteratee(obj);
	    var low = 0, high = getLength(array);
	    while (low < high) {
	      var mid = Math.floor((low + high) / 2);
	      if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
	    }
	    return low;
	  };

	  // Generator function to create the indexOf and lastIndexOf functions
	  function createIndexFinder(dir, predicateFind, sortedIndex) {
	    return function(array, item, idx) {
	      var i = 0, length = getLength(array);
	      if (typeof idx == 'number') {
	        if (dir > 0) {
	            i = idx >= 0 ? idx : Math.max(idx + length, i);
	        } else {
	            length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
	        }
	      } else if (sortedIndex && idx && length) {
	        idx = sortedIndex(array, item);
	        return array[idx] === item ? idx : -1;
	      }
	      if (item !== item) {
	        idx = predicateFind(slice.call(array, i, length), _.isNaN);
	        return idx >= 0 ? idx + i : -1;
	      }
	      for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
	        if (array[idx] === item) return idx;
	      }
	      return -1;
	    };
	  }

	  // Return the position of the first occurrence of an item in an array,
	  // or -1 if the item is not included in the array.
	  // If the array is large and already in sort order, pass `true`
	  // for **isSorted** to use binary search.
	  _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);
	  _.lastIndexOf = createIndexFinder(-1, _.findLastIndex);

	  // Generate an integer Array containing an arithmetic progression. A port of
	  // the native Python `range()` function. See
	  // [the Python documentation](http://docs.python.org/library/functions.html#range).
	  _.range = function(start, stop, step) {
	    if (stop == null) {
	      stop = start || 0;
	      start = 0;
	    }
	    step = step || 1;

	    var length = Math.max(Math.ceil((stop - start) / step), 0);
	    var range = Array(length);

	    for (var idx = 0; idx < length; idx++, start += step) {
	      range[idx] = start;
	    }

	    return range;
	  };

	  // Function (ahem) Functions
	  // ------------------

	  // Determines whether to execute a function as a constructor
	  // or a normal function with the provided arguments
	  var executeBound = function(sourceFunc, boundFunc, context, callingContext, args) {
	    if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
	    var self = baseCreate(sourceFunc.prototype);
	    var result = sourceFunc.apply(self, args);
	    if (_.isObject(result)) return result;
	    return self;
	  };

	  // Create a function bound to a given object (assigning `this`, and arguments,
	  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
	  // available.
	  _.bind = function(func, context) {
	    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
	    if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
	    var args = slice.call(arguments, 2);
	    var bound = function() {
	      return executeBound(func, bound, context, this, args.concat(slice.call(arguments)));
	    };
	    return bound;
	  };

	  // Partially apply a function by creating a version that has had some of its
	  // arguments pre-filled, without changing its dynamic `this` context. _ acts
	  // as a placeholder, allowing any combination of arguments to be pre-filled.
	  _.partial = function(func) {
	    var boundArgs = slice.call(arguments, 1);
	    var bound = function() {
	      var position = 0, length = boundArgs.length;
	      var args = Array(length);
	      for (var i = 0; i < length; i++) {
	        args[i] = boundArgs[i] === _ ? arguments[position++] : boundArgs[i];
	      }
	      while (position < arguments.length) args.push(arguments[position++]);
	      return executeBound(func, bound, this, this, args);
	    };
	    return bound;
	  };

	  // Bind a number of an object's methods to that object. Remaining arguments
	  // are the method names to be bound. Useful for ensuring that all callbacks
	  // defined on an object belong to it.
	  _.bindAll = function(obj) {
	    var i, length = arguments.length, key;
	    if (length <= 1) throw new Error('bindAll must be passed function names');
	    for (i = 1; i < length; i++) {
	      key = arguments[i];
	      obj[key] = _.bind(obj[key], obj);
	    }
	    return obj;
	  };

	  // Memoize an expensive function by storing its results.
	  _.memoize = function(func, hasher) {
	    var memoize = function(key) {
	      var cache = memoize.cache;
	      var address = '' + (hasher ? hasher.apply(this, arguments) : key);
	      if (!_.has(cache, address)) cache[address] = func.apply(this, arguments);
	      return cache[address];
	    };
	    memoize.cache = {};
	    return memoize;
	  };

	  // Delays a function for the given number of milliseconds, and then calls
	  // it with the arguments supplied.
	  _.delay = function(func, wait) {
	    var args = slice.call(arguments, 2);
	    return setTimeout(function(){
	      return func.apply(null, args);
	    }, wait);
	  };

	  // Defers a function, scheduling it to run after the current call stack has
	  // cleared.
	  _.defer = _.partial(_.delay, _, 1);

	  // Returns a function, that, when invoked, will only be triggered at most once
	  // during a given window of time. Normally, the throttled function will run
	  // as much as it can, without ever going more than once per `wait` duration;
	  // but if you'd like to disable the execution on the leading edge, pass
	  // `{leading: false}`. To disable execution on the trailing edge, ditto.
	  _.throttle = function(func, wait, options) {
	    var context, args, result;
	    var timeout = null;
	    var previous = 0;
	    if (!options) options = {};
	    var later = function() {
	      previous = options.leading === false ? 0 : _.now();
	      timeout = null;
	      result = func.apply(context, args);
	      if (!timeout) context = args = null;
	    };
	    return function() {
	      var now = _.now();
	      if (!previous && options.leading === false) previous = now;
	      var remaining = wait - (now - previous);
	      context = this;
	      args = arguments;
	      if (remaining <= 0 || remaining > wait) {
	        if (timeout) {
	          clearTimeout(timeout);
	          timeout = null;
	        }
	        previous = now;
	        result = func.apply(context, args);
	        if (!timeout) context = args = null;
	      } else if (!timeout && options.trailing !== false) {
	        timeout = setTimeout(later, remaining);
	      }
	      return result;
	    };
	  };

	  // Returns a function, that, as long as it continues to be invoked, will not
	  // be triggered. The function will be called after it stops being called for
	  // N milliseconds. If `immediate` is passed, trigger the function on the
	  // leading edge, instead of the trailing.
	  _.debounce = function(func, wait, immediate) {
	    var timeout, args, context, timestamp, result;

	    var later = function() {
	      var last = _.now() - timestamp;

	      if (last < wait && last >= 0) {
	        timeout = setTimeout(later, wait - last);
	      } else {
	        timeout = null;
	        if (!immediate) {
	          result = func.apply(context, args);
	          if (!timeout) context = args = null;
	        }
	      }
	    };

	    return function() {
	      context = this;
	      args = arguments;
	      timestamp = _.now();
	      var callNow = immediate && !timeout;
	      if (!timeout) timeout = setTimeout(later, wait);
	      if (callNow) {
	        result = func.apply(context, args);
	        context = args = null;
	      }

	      return result;
	    };
	  };

	  // Returns the first function passed as an argument to the second,
	  // allowing you to adjust arguments, run code before and after, and
	  // conditionally execute the original function.
	  _.wrap = function(func, wrapper) {
	    return _.partial(wrapper, func);
	  };

	  // Returns a negated version of the passed-in predicate.
	  _.negate = function(predicate) {
	    return function() {
	      return !predicate.apply(this, arguments);
	    };
	  };

	  // Returns a function that is the composition of a list of functions, each
	  // consuming the return value of the function that follows.
	  _.compose = function() {
	    var args = arguments;
	    var start = args.length - 1;
	    return function() {
	      var i = start;
	      var result = args[start].apply(this, arguments);
	      while (i--) result = args[i].call(this, result);
	      return result;
	    };
	  };

	  // Returns a function that will only be executed on and after the Nth call.
	  _.after = function(times, func) {
	    return function() {
	      if (--times < 1) {
	        return func.apply(this, arguments);
	      }
	    };
	  };

	  // Returns a function that will only be executed up to (but not including) the Nth call.
	  _.before = function(times, func) {
	    var memo;
	    return function() {
	      if (--times > 0) {
	        memo = func.apply(this, arguments);
	      }
	      if (times <= 1) func = null;
	      return memo;
	    };
	  };

	  // Returns a function that will be executed at most one time, no matter how
	  // often you call it. Useful for lazy initialization.
	  _.once = _.partial(_.before, 2);

	  // Object Functions
	  // ----------------

	  // Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
	  var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');
	  var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
	                      'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

	  function collectNonEnumProps(obj, keys) {
	    var nonEnumIdx = nonEnumerableProps.length;
	    var constructor = obj.constructor;
	    var proto = (_.isFunction(constructor) && constructor.prototype) || ObjProto;

	    // Constructor is a special case.
	    var prop = 'constructor';
	    if (_.has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);

	    while (nonEnumIdx--) {
	      prop = nonEnumerableProps[nonEnumIdx];
	      if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
	        keys.push(prop);
	      }
	    }
	  }

	  // Retrieve the names of an object's own properties.
	  // Delegates to **ECMAScript 5**'s native `Object.keys`
	  _.keys = function(obj) {
	    if (!_.isObject(obj)) return [];
	    if (nativeKeys) return nativeKeys(obj);
	    var keys = [];
	    for (var key in obj) if (_.has(obj, key)) keys.push(key);
	    // Ahem, IE < 9.
	    if (hasEnumBug) collectNonEnumProps(obj, keys);
	    return keys;
	  };

	  // Retrieve all the property names of an object.
	  _.allKeys = function(obj) {
	    if (!_.isObject(obj)) return [];
	    var keys = [];
	    for (var key in obj) keys.push(key);
	    // Ahem, IE < 9.
	    if (hasEnumBug) collectNonEnumProps(obj, keys);
	    return keys;
	  };

	  // Retrieve the values of an object's properties.
	  _.values = function(obj) {
	    var keys = _.keys(obj);
	    var length = keys.length;
	    var values = Array(length);
	    for (var i = 0; i < length; i++) {
	      values[i] = obj[keys[i]];
	    }
	    return values;
	  };

	  // Returns the results of applying the iteratee to each element of the object
	  // In contrast to _.map it returns an object
	  _.mapObject = function(obj, iteratee, context) {
	    iteratee = cb(iteratee, context);
	    var keys =  _.keys(obj),
	          length = keys.length,
	          results = {},
	          currentKey;
	      for (var index = 0; index < length; index++) {
	        currentKey = keys[index];
	        results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
	      }
	      return results;
	  };

	  // Convert an object into a list of `[key, value]` pairs.
	  _.pairs = function(obj) {
	    var keys = _.keys(obj);
	    var length = keys.length;
	    var pairs = Array(length);
	    for (var i = 0; i < length; i++) {
	      pairs[i] = [keys[i], obj[keys[i]]];
	    }
	    return pairs;
	  };

	  // Invert the keys and values of an object. The values must be serializable.
	  _.invert = function(obj) {
	    var result = {};
	    var keys = _.keys(obj);
	    for (var i = 0, length = keys.length; i < length; i++) {
	      result[obj[keys[i]]] = keys[i];
	    }
	    return result;
	  };

	  // Return a sorted list of the function names available on the object.
	  // Aliased as `methods`
	  _.functions = _.methods = function(obj) {
	    var names = [];
	    for (var key in obj) {
	      if (_.isFunction(obj[key])) names.push(key);
	    }
	    return names.sort();
	  };

	  // Extend a given object with all the properties in passed-in object(s).
	  _.extend = createAssigner(_.allKeys);

	  // Assigns a given object with all the own properties in the passed-in object(s)
	  // (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
	  _.extendOwn = _.assign = createAssigner(_.keys);

	  // Returns the first key on an object that passes a predicate test
	  _.findKey = function(obj, predicate, context) {
	    predicate = cb(predicate, context);
	    var keys = _.keys(obj), key;
	    for (var i = 0, length = keys.length; i < length; i++) {
	      key = keys[i];
	      if (predicate(obj[key], key, obj)) return key;
	    }
	  };

	  // Return a copy of the object only containing the whitelisted properties.
	  _.pick = function(object, oiteratee, context) {
	    var result = {}, obj = object, iteratee, keys;
	    if (obj == null) return result;
	    if (_.isFunction(oiteratee)) {
	      keys = _.allKeys(obj);
	      iteratee = optimizeCb(oiteratee, context);
	    } else {
	      keys = flatten(arguments, false, false, 1);
	      iteratee = function(value, key, obj) { return key in obj; };
	      obj = Object(obj);
	    }
	    for (var i = 0, length = keys.length; i < length; i++) {
	      var key = keys[i];
	      var value = obj[key];
	      if (iteratee(value, key, obj)) result[key] = value;
	    }
	    return result;
	  };

	   // Return a copy of the object without the blacklisted properties.
	  _.omit = function(obj, iteratee, context) {
	    if (_.isFunction(iteratee)) {
	      iteratee = _.negate(iteratee);
	    } else {
	      var keys = _.map(flatten(arguments, false, false, 1), String);
	      iteratee = function(value, key) {
	        return !_.contains(keys, key);
	      };
	    }
	    return _.pick(obj, iteratee, context);
	  };

	  // Fill in a given object with default properties.
	  _.defaults = createAssigner(_.allKeys, true);

	  // Creates an object that inherits from the given prototype object.
	  // If additional properties are provided then they will be added to the
	  // created object.
	  _.create = function(prototype, props) {
	    var result = baseCreate(prototype);
	    if (props) _.extendOwn(result, props);
	    return result;
	  };

	  // Create a (shallow-cloned) duplicate of an object.
	  _.clone = function(obj) {
	    if (!_.isObject(obj)) return obj;
	    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
	  };

	  // Invokes interceptor with the obj, and then returns obj.
	  // The primary purpose of this method is to "tap into" a method chain, in
	  // order to perform operations on intermediate results within the chain.
	  _.tap = function(obj, interceptor) {
	    interceptor(obj);
	    return obj;
	  };

	  // Returns whether an object has a given set of `key:value` pairs.
	  _.isMatch = function(object, attrs) {
	    var keys = _.keys(attrs), length = keys.length;
	    if (object == null) return !length;
	    var obj = Object(object);
	    for (var i = 0; i < length; i++) {
	      var key = keys[i];
	      if (attrs[key] !== obj[key] || !(key in obj)) return false;
	    }
	    return true;
	  };


	  // Internal recursive comparison function for `isEqual`.
	  var eq = function(a, b, aStack, bStack) {
	    // Identical objects are equal. `0 === -0`, but they aren't identical.
	    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
	    if (a === b) return a !== 0 || 1 / a === 1 / b;
	    // A strict comparison is necessary because `null == undefined`.
	    if (a == null || b == null) return a === b;
	    // Unwrap any wrapped objects.
	    if (a instanceof _) a = a._wrapped;
	    if (b instanceof _) b = b._wrapped;
	    // Compare `[[Class]]` names.
	    var className = toString.call(a);
	    if (className !== toString.call(b)) return false;
	    switch (className) {
	      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
	      case '[object RegExp]':
	      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
	      case '[object String]':
	        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
	        // equivalent to `new String("5")`.
	        return '' + a === '' + b;
	      case '[object Number]':
	        // `NaN`s are equivalent, but non-reflexive.
	        // Object(NaN) is equivalent to NaN
	        if (+a !== +a) return +b !== +b;
	        // An `egal` comparison is performed for other numeric values.
	        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
	      case '[object Date]':
	      case '[object Boolean]':
	        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
	        // millisecond representations. Note that invalid dates with millisecond representations
	        // of `NaN` are not equivalent.
	        return +a === +b;
	    }

	    var areArrays = className === '[object Array]';
	    if (!areArrays) {
	      if (typeof a != 'object' || typeof b != 'object') return false;

	      // Objects with different constructors are not equivalent, but `Object`s or `Array`s
	      // from different frames are.
	      var aCtor = a.constructor, bCtor = b.constructor;
	      if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
	                               _.isFunction(bCtor) && bCtor instanceof bCtor)
	                          && ('constructor' in a && 'constructor' in b)) {
	        return false;
	      }
	    }
	    // Assume equality for cyclic structures. The algorithm for detecting cyclic
	    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

	    // Initializing stack of traversed objects.
	    // It's done here since we only need them for objects and arrays comparison.
	    aStack = aStack || [];
	    bStack = bStack || [];
	    var length = aStack.length;
	    while (length--) {
	      // Linear search. Performance is inversely proportional to the number of
	      // unique nested structures.
	      if (aStack[length] === a) return bStack[length] === b;
	    }

	    // Add the first object to the stack of traversed objects.
	    aStack.push(a);
	    bStack.push(b);

	    // Recursively compare objects and arrays.
	    if (areArrays) {
	      // Compare array lengths to determine if a deep comparison is necessary.
	      length = a.length;
	      if (length !== b.length) return false;
	      // Deep compare the contents, ignoring non-numeric properties.
	      while (length--) {
	        if (!eq(a[length], b[length], aStack, bStack)) return false;
	      }
	    } else {
	      // Deep compare objects.
	      var keys = _.keys(a), key;
	      length = keys.length;
	      // Ensure that both objects contain the same number of properties before comparing deep equality.
	      if (_.keys(b).length !== length) return false;
	      while (length--) {
	        // Deep compare each member
	        key = keys[length];
	        if (!(_.has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
	      }
	    }
	    // Remove the first object from the stack of traversed objects.
	    aStack.pop();
	    bStack.pop();
	    return true;
	  };

	  // Perform a deep comparison to check if two objects are equal.
	  _.isEqual = function(a, b) {
	    return eq(a, b);
	  };

	  // Is a given array, string, or object empty?
	  // An "empty" object has no enumerable own-properties.
	  _.isEmpty = function(obj) {
	    if (obj == null) return true;
	    if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
	    return _.keys(obj).length === 0;
	  };

	  // Is a given value a DOM element?
	  _.isElement = function(obj) {
	    return !!(obj && obj.nodeType === 1);
	  };

	  // Is a given value an array?
	  // Delegates to ECMA5's native Array.isArray
	  _.isArray = nativeIsArray || function(obj) {
	    return toString.call(obj) === '[object Array]';
	  };

	  // Is a given variable an object?
	  _.isObject = function(obj) {
	    var type = typeof obj;
	    return type === 'function' || type === 'object' && !!obj;
	  };

	  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError.
	  _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error'], function(name) {
	    _['is' + name] = function(obj) {
	      return toString.call(obj) === '[object ' + name + ']';
	    };
	  });

	  // Define a fallback version of the method in browsers (ahem, IE < 9), where
	  // there isn't any inspectable "Arguments" type.
	  if (!_.isArguments(arguments)) {
	    _.isArguments = function(obj) {
	      return _.has(obj, 'callee');
	    };
	  }

	  // Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
	  // IE 11 (#1621), and in Safari 8 (#1929).
	  if (typeof /./ != 'function' && typeof Int8Array != 'object') {
	    _.isFunction = function(obj) {
	      return typeof obj == 'function' || false;
	    };
	  }

	  // Is a given object a finite number?
	  _.isFinite = function(obj) {
	    return isFinite(obj) && !isNaN(parseFloat(obj));
	  };

	  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
	  _.isNaN = function(obj) {
	    return _.isNumber(obj) && obj !== +obj;
	  };

	  // Is a given value a boolean?
	  _.isBoolean = function(obj) {
	    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
	  };

	  // Is a given value equal to null?
	  _.isNull = function(obj) {
	    return obj === null;
	  };

	  // Is a given variable undefined?
	  _.isUndefined = function(obj) {
	    return obj === void 0;
	  };

	  // Shortcut function for checking if an object has a given property directly
	  // on itself (in other words, not on a prototype).
	  _.has = function(obj, key) {
	    return obj != null && hasOwnProperty.call(obj, key);
	  };

	  // Utility Functions
	  // -----------------

	  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
	  // previous owner. Returns a reference to the Underscore object.
	  _.noConflict = function() {
	    root._ = previousUnderscore;
	    return this;
	  };

	  // Keep the identity function around for default iteratees.
	  _.identity = function(value) {
	    return value;
	  };

	  // Predicate-generating functions. Often useful outside of Underscore.
	  _.constant = function(value) {
	    return function() {
	      return value;
	    };
	  };

	  _.noop = function(){};

	  _.property = property;

	  // Generates a function for a given object that returns a given property.
	  _.propertyOf = function(obj) {
	    return obj == null ? function(){} : function(key) {
	      return obj[key];
	    };
	  };

	  // Returns a predicate for checking whether an object has a given set of
	  // `key:value` pairs.
	  _.matcher = _.matches = function(attrs) {
	    attrs = _.extendOwn({}, attrs);
	    return function(obj) {
	      return _.isMatch(obj, attrs);
	    };
	  };

	  // Run a function **n** times.
	  _.times = function(n, iteratee, context) {
	    var accum = Array(Math.max(0, n));
	    iteratee = optimizeCb(iteratee, context, 1);
	    for (var i = 0; i < n; i++) accum[i] = iteratee(i);
	    return accum;
	  };

	  // Return a random integer between min and max (inclusive).
	  _.random = function(min, max) {
	    if (max == null) {
	      max = min;
	      min = 0;
	    }
	    return min + Math.floor(Math.random() * (max - min + 1));
	  };

	  // A (possibly faster) way to get the current timestamp as an integer.
	  _.now = Date.now || function() {
	    return new Date().getTime();
	  };

	   // List of HTML entities for escaping.
	  var escapeMap = {
	    '&': '&amp;',
	    '<': '&lt;',
	    '>': '&gt;',
	    '"': '&quot;',
	    "'": '&#x27;',
	    '`': '&#x60;'
	  };
	  var unescapeMap = _.invert(escapeMap);

	  // Functions for escaping and unescaping strings to/from HTML interpolation.
	  var createEscaper = function(map) {
	    var escaper = function(match) {
	      return map[match];
	    };
	    // Regexes for identifying a key that needs to be escaped
	    var source = '(?:' + _.keys(map).join('|') + ')';
	    var testRegexp = RegExp(source);
	    var replaceRegexp = RegExp(source, 'g');
	    return function(string) {
	      string = string == null ? '' : '' + string;
	      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
	    };
	  };
	  _.escape = createEscaper(escapeMap);
	  _.unescape = createEscaper(unescapeMap);

	  // If the value of the named `property` is a function then invoke it with the
	  // `object` as context; otherwise, return it.
	  _.result = function(object, property, fallback) {
	    var value = object == null ? void 0 : object[property];
	    if (value === void 0) {
	      value = fallback;
	    }
	    return _.isFunction(value) ? value.call(object) : value;
	  };

	  // Generate a unique integer id (unique within the entire client session).
	  // Useful for temporary DOM ids.
	  var idCounter = 0;
	  _.uniqueId = function(prefix) {
	    var id = ++idCounter + '';
	    return prefix ? prefix + id : id;
	  };

	  // By default, Underscore uses ERB-style template delimiters, change the
	  // following template settings to use alternative delimiters.
	  _.templateSettings = {
	    evaluate    : /<%([\s\S]+?)%>/g,
	    interpolate : /<%=([\s\S]+?)%>/g,
	    escape      : /<%-([\s\S]+?)%>/g
	  };

	  // When customizing `templateSettings`, if you don't want to define an
	  // interpolation, evaluation or escaping regex, we need one that is
	  // guaranteed not to match.
	  var noMatch = /(.)^/;

	  // Certain characters need to be escaped so that they can be put into a
	  // string literal.
	  var escapes = {
	    "'":      "'",
	    '\\':     '\\',
	    '\r':     'r',
	    '\n':     'n',
	    '\u2028': 'u2028',
	    '\u2029': 'u2029'
	  };

	  var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

	  var escapeChar = function(match) {
	    return '\\' + escapes[match];
	  };

	  // JavaScript micro-templating, similar to John Resig's implementation.
	  // Underscore templating handles arbitrary delimiters, preserves whitespace,
	  // and correctly escapes quotes within interpolated code.
	  // NB: `oldSettings` only exists for backwards compatibility.
	  _.template = function(text, settings, oldSettings) {
	    if (!settings && oldSettings) settings = oldSettings;
	    settings = _.defaults({}, settings, _.templateSettings);

	    // Combine delimiters into one regular expression via alternation.
	    var matcher = RegExp([
	      (settings.escape || noMatch).source,
	      (settings.interpolate || noMatch).source,
	      (settings.evaluate || noMatch).source
	    ].join('|') + '|$', 'g');

	    // Compile the template source, escaping string literals appropriately.
	    var index = 0;
	    var source = "__p+='";
	    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
	      source += text.slice(index, offset).replace(escaper, escapeChar);
	      index = offset + match.length;

	      if (escape) {
	        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
	      } else if (interpolate) {
	        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
	      } else if (evaluate) {
	        source += "';\n" + evaluate + "\n__p+='";
	      }

	      // Adobe VMs need the match returned to produce the correct offest.
	      return match;
	    });
	    source += "';\n";

	    // If a variable is not specified, place data values in local scope.
	    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

	    source = "var __t,__p='',__j=Array.prototype.join," +
	      "print=function(){__p+=__j.call(arguments,'');};\n" +
	      source + 'return __p;\n';

	    try {
	      var render = new Function(settings.variable || 'obj', '_', source);
	    } catch (e) {
	      e.source = source;
	      throw e;
	    }

	    var template = function(data) {
	      return render.call(this, data, _);
	    };

	    // Provide the compiled source as a convenience for precompilation.
	    var argument = settings.variable || 'obj';
	    template.source = 'function(' + argument + '){\n' + source + '}';

	    return template;
	  };

	  // Add a "chain" function. Start chaining a wrapped Underscore object.
	  _.chain = function(obj) {
	    var instance = _(obj);
	    instance._chain = true;
	    return instance;
	  };

	  // OOP
	  // ---------------
	  // If Underscore is called as a function, it returns a wrapped object that
	  // can be used OO-style. This wrapper holds altered versions of all the
	  // underscore functions. Wrapped objects may be chained.

	  // Helper function to continue chaining intermediate results.
	  var result = function(instance, obj) {
	    return instance._chain ? _(obj).chain() : obj;
	  };

	  // Add your own custom functions to the Underscore object.
	  _.mixin = function(obj) {
	    _.each(_.functions(obj), function(name) {
	      var func = _[name] = obj[name];
	      _.prototype[name] = function() {
	        var args = [this._wrapped];
	        push.apply(args, arguments);
	        return result(this, func.apply(_, args));
	      };
	    });
	  };

	  // Add all of the Underscore functions to the wrapper object.
	  _.mixin(_);

	  // Add all mutator Array functions to the wrapper.
	  _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
	    var method = ArrayProto[name];
	    _.prototype[name] = function() {
	      var obj = this._wrapped;
	      method.apply(obj, arguments);
	      if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
	      return result(this, obj);
	    };
	  });

	  // Add all accessor Array functions to the wrapper.
	  _.each(['concat', 'join', 'slice'], function(name) {
	    var method = ArrayProto[name];
	    _.prototype[name] = function() {
	      return result(this, method.apply(this._wrapped, arguments));
	    };
	  });

	  // Extracts the result from a wrapped and chained object.
	  _.prototype.value = function() {
	    return this._wrapped;
	  };

	  // Provide unwrapping proxy for some methods used in engine operations
	  // such as arithmetic and JSON stringification.
	  _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;

	  _.prototype.toString = function() {
	    return '' + this._wrapped;
	  };

	  // AMD registration happens at the end for compatibility with AMD loaders
	  // that may not enforce next-turn semantics on modules. Even though general
	  // practice for AMD registration is to be anonymous, underscore registers
	  // as a named module because, like jQuery, it is a base library that is
	  // popular enough to be bundled in a third party lib, but not be part of
	  // an AMD load request. Those cases could generate an error when an
	  // anonymous define() is called outside of a loader request.
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function() {
	      return _;
	    }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  }
	}.call(this));


/***/ },
/* 7 */
/***/ function(module, exports) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	function EventEmitter() {
	  this._events = this._events || {};
	  this._maxListeners = this._maxListeners || undefined;
	}
	module.exports = EventEmitter;

	// Backwards-compat with node 0.10.x
	EventEmitter.EventEmitter = EventEmitter;

	EventEmitter.prototype._events = undefined;
	EventEmitter.prototype._maxListeners = undefined;

	// By default EventEmitters will print a warning if more than 10 listeners are
	// added to it. This is a useful default which helps finding memory leaks.
	EventEmitter.defaultMaxListeners = 10;

	// Obviously not all Emitters should be limited to 10. This function allows
	// that to be increased. Set to zero for unlimited.
	EventEmitter.prototype.setMaxListeners = function(n) {
	  if (!isNumber(n) || n < 0 || isNaN(n))
	    throw TypeError('n must be a positive number');
	  this._maxListeners = n;
	  return this;
	};

	EventEmitter.prototype.emit = function(type) {
	  var er, handler, len, args, i, listeners;

	  if (!this._events)
	    this._events = {};

	  // If there is no 'error' event listener then throw.
	  if (type === 'error') {
	    if (!this._events.error ||
	        (isObject(this._events.error) && !this._events.error.length)) {
	      er = arguments[1];
	      if (er instanceof Error) {
	        throw er; // Unhandled 'error' event
	      }
	      throw TypeError('Uncaught, unspecified "error" event.');
	    }
	  }

	  handler = this._events[type];

	  if (isUndefined(handler))
	    return false;

	  if (isFunction(handler)) {
	    switch (arguments.length) {
	      // fast cases
	      case 1:
	        handler.call(this);
	        break;
	      case 2:
	        handler.call(this, arguments[1]);
	        break;
	      case 3:
	        handler.call(this, arguments[1], arguments[2]);
	        break;
	      // slower
	      default:
	        args = Array.prototype.slice.call(arguments, 1);
	        handler.apply(this, args);
	    }
	  } else if (isObject(handler)) {
	    args = Array.prototype.slice.call(arguments, 1);
	    listeners = handler.slice();
	    len = listeners.length;
	    for (i = 0; i < len; i++)
	      listeners[i].apply(this, args);
	  }

	  return true;
	};

	EventEmitter.prototype.addListener = function(type, listener) {
	  var m;

	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  if (!this._events)
	    this._events = {};

	  // To avoid recursion in the case that type === "newListener"! Before
	  // adding it to the listeners, first emit "newListener".
	  if (this._events.newListener)
	    this.emit('newListener', type,
	              isFunction(listener.listener) ?
	              listener.listener : listener);

	  if (!this._events[type])
	    // Optimize the case of one listener. Don't need the extra array object.
	    this._events[type] = listener;
	  else if (isObject(this._events[type]))
	    // If we've already got an array, just append.
	    this._events[type].push(listener);
	  else
	    // Adding the second element, need to change to array.
	    this._events[type] = [this._events[type], listener];

	  // Check for listener leak
	  if (isObject(this._events[type]) && !this._events[type].warned) {
	    if (!isUndefined(this._maxListeners)) {
	      m = this._maxListeners;
	    } else {
	      m = EventEmitter.defaultMaxListeners;
	    }

	    if (m && m > 0 && this._events[type].length > m) {
	      this._events[type].warned = true;
	      console.error('(node) warning: possible EventEmitter memory ' +
	                    'leak detected. %d listeners added. ' +
	                    'Use emitter.setMaxListeners() to increase limit.',
	                    this._events[type].length);
	      if (typeof console.trace === 'function') {
	        // not supported in IE 10
	        console.trace();
	      }
	    }
	  }

	  return this;
	};

	EventEmitter.prototype.on = EventEmitter.prototype.addListener;

	EventEmitter.prototype.once = function(type, listener) {
	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  var fired = false;

	  function g() {
	    this.removeListener(type, g);

	    if (!fired) {
	      fired = true;
	      listener.apply(this, arguments);
	    }
	  }

	  g.listener = listener;
	  this.on(type, g);

	  return this;
	};

	// emits a 'removeListener' event iff the listener was removed
	EventEmitter.prototype.removeListener = function(type, listener) {
	  var list, position, length, i;

	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  if (!this._events || !this._events[type])
	    return this;

	  list = this._events[type];
	  length = list.length;
	  position = -1;

	  if (list === listener ||
	      (isFunction(list.listener) && list.listener === listener)) {
	    delete this._events[type];
	    if (this._events.removeListener)
	      this.emit('removeListener', type, listener);

	  } else if (isObject(list)) {
	    for (i = length; i-- > 0;) {
	      if (list[i] === listener ||
	          (list[i].listener && list[i].listener === listener)) {
	        position = i;
	        break;
	      }
	    }

	    if (position < 0)
	      return this;

	    if (list.length === 1) {
	      list.length = 0;
	      delete this._events[type];
	    } else {
	      list.splice(position, 1);
	    }

	    if (this._events.removeListener)
	      this.emit('removeListener', type, listener);
	  }

	  return this;
	};

	EventEmitter.prototype.removeAllListeners = function(type) {
	  var key, listeners;

	  if (!this._events)
	    return this;

	  // not listening for removeListener, no need to emit
	  if (!this._events.removeListener) {
	    if (arguments.length === 0)
	      this._events = {};
	    else if (this._events[type])
	      delete this._events[type];
	    return this;
	  }

	  // emit removeListener for all listeners on all events
	  if (arguments.length === 0) {
	    for (key in this._events) {
	      if (key === 'removeListener') continue;
	      this.removeAllListeners(key);
	    }
	    this.removeAllListeners('removeListener');
	    this._events = {};
	    return this;
	  }

	  listeners = this._events[type];

	  if (isFunction(listeners)) {
	    this.removeListener(type, listeners);
	  } else if (listeners) {
	    // LIFO order
	    while (listeners.length)
	      this.removeListener(type, listeners[listeners.length - 1]);
	  }
	  delete this._events[type];

	  return this;
	};

	EventEmitter.prototype.listeners = function(type) {
	  var ret;
	  if (!this._events || !this._events[type])
	    ret = [];
	  else if (isFunction(this._events[type]))
	    ret = [this._events[type]];
	  else
	    ret = this._events[type].slice();
	  return ret;
	};

	EventEmitter.prototype.listenerCount = function(type) {
	  if (this._events) {
	    var evlistener = this._events[type];

	    if (isFunction(evlistener))
	      return 1;
	    else if (evlistener)
	      return evlistener.length;
	  }
	  return 0;
	};

	EventEmitter.listenerCount = function(emitter, type) {
	  return emitter.listenerCount(type);
	};

	function isFunction(arg) {
	  return typeof arg === 'function';
	}

	function isNumber(arg) {
	  return typeof arg === 'number';
	}

	function isObject(arg) {
	  return typeof arg === 'object' && arg !== null;
	}

	function isUndefined(arg) {
	  return arg === void 0;
	}


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {var Chainer, NativePromiseOnlyPlugin, OctokatBase, Requester, SimpleVerbsPlugin, TREE_OPTIONS, VerbMethods, applyHypermedia, deprecate, plus, uncamelizeObj,
	  slice = [].slice;

	plus = __webpack_require__(9);

	deprecate = __webpack_require__(12);

	TREE_OPTIONS = __webpack_require__(13);

	Chainer = __webpack_require__(14);

	VerbMethods = __webpack_require__(15);

	SimpleVerbsPlugin = __webpack_require__(17);

	NativePromiseOnlyPlugin = __webpack_require__(18);

	Requester = __webpack_require__(20);

	applyHypermedia = __webpack_require__(22);

	uncamelizeObj = function(obj) {
	  var i, j, key, len, o, ref, value;
	  if (Array.isArray(obj)) {
	    return (function() {
	      var j, len, results;
	      results = [];
	      for (j = 0, len = obj.length; j < len; j++) {
	        i = obj[j];
	        results.push(uncamelizeObj(i));
	      }
	      return results;
	    })();
	  } else if (obj === Object(obj)) {
	    o = {};
	    ref = Object.keys(obj);
	    for (j = 0, len = ref.length; j < len; j++) {
	      key = ref[j];
	      value = obj[key];
	      o[plus.uncamelize(key)] = uncamelizeObj(value);
	    }
	    return o;
	  } else {
	    return obj;
	  }
	};

	OctokatBase = function(clientOptions) {
	  var disableHypermedia, instance, plugins, request, verbMethods;
	  if (clientOptions == null) {
	    clientOptions = {};
	  }
	  plugins = clientOptions.plugins || [SimpleVerbsPlugin, NativePromiseOnlyPlugin];
	  disableHypermedia = clientOptions.disableHypermedia;
	  if (disableHypermedia == null) {
	    disableHypermedia = false;
	  }
	  instance = {};
	  request = function(method, path, data, options, cb) {
	    var ref, requester;
	    if (options == null) {
	      options = {
	        raw: false,
	        isBase64: false,
	        isBoolean: false
	      };
	    }
	    if (data && !(typeof global !== "undefined" && global !== null ? (ref = global['Buffer']) != null ? ref.isBuffer(data) : void 0 : void 0)) {
	      data = uncamelizeObj(data);
	    }
	    requester = new Requester(instance, clientOptions, plugins);
	    return requester.request(method, path, data, options, function(err, val) {
	      var context, obj;
	      if (err) {
	        return cb(err);
	      }
	      if (options.raw) {
	        return cb(null, val);
	      }
	      if (!disableHypermedia) {
	        context = {
	          data: val,
	          plugins: plugins,
	          requester: requester,
	          instance: instance,
	          clientOptions: clientOptions
	        };
	        obj = instance._parseWithContext(path, context);
	        return cb(null, obj);
	      } else {
	        return cb(null, val);
	      }
	    });
	  };
	  verbMethods = new VerbMethods(plugins, {
	    request: request
	  });
	  (new Chainer(verbMethods)).chain('', null, TREE_OPTIONS, instance);
	  instance.me = instance.user;
	  instance.parse = function(data) {
	    var context;
	    context = {
	      requester: {
	        request: request
	      },
	      plugins: plugins,
	      data: data,
	      instance: instance,
	      clientOptions: clientOptions
	    };
	    return instance._parseWithContext('', context);
	  };
	  instance._parseWithContext = function(path, context) {
	    var data, j, len, plugin, requester, url;
	    data = context.data, requester = context.requester;
	    url = data.url || path;
	    plus.extend(context, {
	      url: url
	    });
	    for (j = 0, len = plugins.length; j < len; j++) {
	      plugin = plugins[j];
	      if (plugin.responseMiddleware) {
	        plus.extend(context, plugin.responseMiddleware(context));
	      }
	    }
	    data = context.data;
	    return data;
	  };
	  instance._fromUrlWithDefault = function() {
	    var args, defaultFn, path;
	    path = arguments[0], defaultFn = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
	    path = applyHypermedia.apply(null, [path].concat(slice.call(args)));
	    verbMethods.injectVerbMethods(path, defaultFn);
	    return defaultFn;
	  };
	  instance.fromUrl = function() {
	    var args, defaultFn, path;
	    path = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
	    defaultFn = function() {
	      var args;
	      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
	      deprecate('call ....fetch() explicitly instead of ...()');
	      return defaultFn.fetch.apply(defaultFn, args);
	    };
	    return instance._fromUrlWithDefault.apply(instance, [path, defaultFn].concat(slice.call(args)));
	  };
	  instance._fromUrlCurried = function(path, defaultFn) {
	    var fn;
	    fn = function() {
	      var templateArgs;
	      templateArgs = 1 <= arguments.length ? slice.call(arguments, 0) : [];
	      if (defaultFn && templateArgs.length === 0) {
	        return defaultFn.apply(fn);
	      } else {
	        return instance.fromUrl.apply(instance, [path].concat(slice.call(templateArgs)));
	      }
	    };
	    if (!/\{/.test(path)) {
	      verbMethods.injectVerbMethods(path, fn);
	    }
	    return fn;
	  };
	  instance.status = instance.fromUrl('https://status.github.com/api/status.json');
	  instance.status.api = instance.fromUrl('https://status.github.com/api.json');
	  instance.status.lastMessage = instance.fromUrl('https://status.github.com/api/last-message.json');
	  instance.status.messages = instance.fromUrl('https://status.github.com/api/messages.json');
	  return instance;
	};

	module.exports = OctokatBase;

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	var filter, forEach, plus;

	filter = __webpack_require__(10);

	forEach = __webpack_require__(11);

	plus = {
	  camelize: function(string) {
	    if (string) {
	      return string.replace(/[_-]+(\w)/g, function(m) {
	        return m[1].toUpperCase();
	      });
	    } else {
	      return '';
	    }
	  },
	  uncamelize: function(string) {
	    if (!string) {
	      return '';
	    }
	    return string.replace(/([A-Z])+/g, function(match, letter) {
	      if (letter == null) {
	        letter = '';
	      }
	      return "_" + (letter.toLowerCase());
	    });
	  },
	  dasherize: function(string) {
	    if (!string) {
	      return '';
	    }
	    string = string[0].toLowerCase() + string.slice(1);
	    return string.replace(/([A-Z])|(_)/g, function(m, letter) {
	      if (letter) {
	        return '-' + letter.toLowerCase();
	      } else {
	        return '-';
	      }
	    });
	  },
	  extend: function(target, source) {
	    var i, key, len, ref, results;
	    if (source) {
	      ref = Object.keys(source);
	      results = [];
	      for (i = 0, len = ref.length; i < len; i++) {
	        key = ref[i];
	        results.push(target[key] = source[key]);
	      }
	      return results;
	    }
	  },
	  forOwn: function(obj, iterator) {
	    var i, key, len, ref, results;
	    ref = Object.keys(obj);
	    results = [];
	    for (i = 0, len = ref.length; i < len; i++) {
	      key = ref[i];
	      results.push(iterator(obj[key], key));
	    }
	    return results;
	  },
	  filter: filter,
	  forEach: forEach
	};

	module.exports = plus;


/***/ },
/* 10 */
/***/ function(module, exports) {

	/**
	 * A specialized version of `_.filter` for arrays without support for callback
	 * shorthands and `this` binding.
	 *
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} predicate The function invoked per iteration.
	 * @returns {Array} Returns the new filtered array.
	 */
	function arrayFilter(array, predicate) {
	  var index = -1,
	      length = array.length,
	      resIndex = -1,
	      result = [];

	  while (++index < length) {
	    var value = array[index];
	    if (predicate(value, index, array)) {
	      result[++resIndex] = value;
	    }
	  }
	  return result;
	}

	module.exports = arrayFilter;


/***/ },
/* 11 */
/***/ function(module, exports) {

	/**
	 * A specialized version of `_.forEach` for arrays without support for callback
	 * shorthands and `this` binding.
	 *
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Array} Returns `array`.
	 */
	function arrayEach(array, iteratee) {
	  var index = -1,
	      length = array.length;

	  while (++index < length) {
	    if (iteratee(array[index], index, array) === false) {
	      break;
	    }
	  }
	  return array;
	}

	module.exports = arrayEach;


/***/ },
/* 12 */
/***/ function(module, exports) {

	module.exports = function(message) {
	  return typeof console !== "undefined" && console !== null ? typeof console.warn === "function" ? console.warn("Octokat Deprecation: " + message) : void 0 : void 0;
	};


/***/ },
/* 13 */
/***/ function(module, exports) {

	module.exports = {
	  'zen': false,
	  'octocat': false,
	  'organizations': false,
	  'issues': false,
	  'emojis': false,
	  'markdown': false,
	  'meta': false,
	  'rate_limit': false,
	  'feeds': false,
	  'events': false,
	  'notifications': {
	    'threads': {
	      'subscription': false
	    }
	  },
	  'gitignore': {
	    'templates': false
	  },
	  'user': {
	    'repos': false,
	    'orgs': false,
	    'followers': false,
	    'following': false,
	    'emails': false,
	    'issues': false,
	    'starred': false,
	    'teams': false
	  },
	  'orgs': {
	    'repos': false,
	    'issues': false,
	    'members': false,
	    'events': false,
	    'teams': false
	  },
	  'teams': {
	    'members': false,
	    'memberships': false,
	    'repos': false
	  },
	  'users': {
	    'repos': false,
	    'orgs': false,
	    'gists': false,
	    'followers': false,
	    'following': false,
	    'keys': false,
	    'starred': false,
	    'received_events': {
	      'public': false
	    },
	    'events': {
	      'public': false,
	      'orgs': false
	    },
	    'site_admin': false,
	    'suspended': false
	  },
	  'search': {
	    'repositories': false,
	    'issues': false,
	    'users': false,
	    'code': false
	  },
	  'gists': {
	    'public': false,
	    'starred': false,
	    'star': false,
	    'comments': false,
	    'forks': false
	  },
	  'repos': {
	    'readme': false,
	    'tarball': false,
	    'zipball': false,
	    'compare': false,
	    'deployments': {
	      'statuses': false
	    },
	    'hooks': {
	      'tests': false
	    },
	    'assignees': false,
	    'languages': false,
	    'teams': false,
	    'tags': false,
	    'branches': false,
	    'contributors': false,
	    'subscribers': false,
	    'subscription': false,
	    'stargazers': false,
	    'comments': false,
	    'downloads': false,
	    'forks': false,
	    'milestones': {
	      'labels': false
	    },
	    'labels': false,
	    'releases': {
	      'assets': false,
	      'latest': false,
	      'tags': false
	    },
	    'events': false,
	    'notifications': false,
	    'merges': false,
	    'statuses': false,
	    'pulls': {
	      'merge': false,
	      'comments': false,
	      'commits': false,
	      'files': false,
	      'events': false,
	      'labels': false
	    },
	    'pages': {
	      'builds': {
	        'latest': false
	      }
	    },
	    'commits': {
	      'comments': false,
	      'status': false,
	      'statuses': false
	    },
	    'contents': false,
	    'collaborators': false,
	    'issues': {
	      'events': false,
	      'comments': false,
	      'labels': false
	    },
	    'git': {
	      'refs': {
	        'heads': false,
	        'tags': false
	      },
	      'trees': false,
	      'blobs': false,
	      'commits': false
	    },
	    'stats': {
	      'contributors': false,
	      'commit_activity': false,
	      'code_frequency': false,
	      'participation': false,
	      'punch_card': false
	    }
	  },
	  'licenses': false,
	  'authorizations': {
	    'clients': false
	  },
	  'applications': {
	    'tokens': false
	  },
	  'enterprise': {
	    'settings': {
	      'license': false
	    },
	    'stats': {
	      'issues': false,
	      'hooks': false,
	      'milestones': false,
	      'orgs': false,
	      'comments': false,
	      'pages': false,
	      'users': false,
	      'gists': false,
	      'pulls': false,
	      'repos': false,
	      'all': false
	    }
	  },
	  'staff': {
	    'indexing_jobs': false
	  },
	  'setup': {
	    'api': {
	      'start': false,
	      'upgrade': false,
	      'configcheck': false,
	      'configure': false,
	      'settings': {
	        'authorized-keys': false
	      },
	      'maintenance': false
	    }
	  }
	};


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	var Chainer, plus,
	  slice = [].slice;

	plus = __webpack_require__(9);

	module.exports = Chainer = (function() {
	  function Chainer(_verbMethods) {
	    this._verbMethods = _verbMethods;
	  }

	  Chainer.prototype.chain = function(path, name, contextTree, fn) {
	    var fn1;
	    if (fn == null) {
	      fn = (function(_this) {
	        return function() {
	          var args, separator;
	          args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
	          if (!args.length) {
	            throw new Error('BUG! must be called with at least one argument');
	          }
	          if (name === 'compare') {
	            separator = '...';
	          } else {
	            separator = '/';
	          }
	          return _this.chain(path + "/" + (args.join(separator)), name, contextTree);
	        };
	      })(this);
	    }
	    this._verbMethods.injectVerbMethods(path, fn);
	    if (typeof fn === 'function' || typeof fn === 'object') {
	      fn1 = (function(_this) {
	        return function(name) {
	          delete fn[plus.camelize(name)];
	          return Object.defineProperty(fn, plus.camelize(name), {
	            configurable: true,
	            enumerable: true,
	            get: function() {
	              return _this.chain(path + "/" + name, name, contextTree[name]);
	            }
	          });
	        };
	      })(this);
	      for (name in contextTree || {}) {
	        fn1(name);
	      }
	    }
	    return fn;
	  };

	  return Chainer;

	})();

	module.exports = Chainer;


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	var VerbMethods, extend, filter, forOwn, ref, toPromise, toQueryString,
	  slice = [].slice;

	ref = __webpack_require__(9), filter = ref.filter, forOwn = ref.forOwn, extend = ref.extend;

	toQueryString = __webpack_require__(16);

	toPromise = function(orig, newPromise) {
	  return function() {
	    var args, last;
	    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
	    last = args[args.length - 1];
	    if (typeof last === 'function') {
	      args.pop();
	      return orig.apply(null, [last].concat(slice.call(args)));
	    } else if (newPromise) {
	      return newPromise(function(resolve, reject) {
	        var cb;
	        cb = function(err, val) {
	          if (err) {
	            return reject(err);
	          }
	          return resolve(val);
	        };
	        return orig.apply(null, [cb].concat(slice.call(args)));
	      });
	    } else {
	      throw new Error('You must specify a callback or have a promise library loaded');
	    }
	  };
	};

	module.exports = VerbMethods = (function() {
	  function VerbMethods(plugins, _requester) {
	    var i, j, len, len1, plugin, promisePlugins, ref1, ref2;
	    this._requester = _requester;
	    if (!this._requester) {
	      throw new Error('Octokat BUG: request is required');
	    }
	    promisePlugins = filter(plugins, function(arg) {
	      var promiseCreator;
	      promiseCreator = arg.promiseCreator;
	      return promiseCreator;
	    });
	    if (promisePlugins) {
	      this._promisePlugin = promisePlugins[0];
	    }
	    this._syncVerbs = {};
	    ref1 = filter(plugins, function(arg) {
	      var verbs;
	      verbs = arg.verbs;
	      return verbs;
	    });
	    for (i = 0, len = ref1.length; i < len; i++) {
	      plugin = ref1[i];
	      extend(this._syncVerbs, plugin.verbs);
	    }
	    this._asyncVerbs = {};
	    ref2 = filter(plugins, function(arg) {
	      var asyncVerbs;
	      asyncVerbs = arg.asyncVerbs;
	      return asyncVerbs;
	    });
	    for (j = 0, len1 = ref2.length; j < len1; j++) {
	      plugin = ref2[j];
	      extend(this._asyncVerbs, plugin.asyncVerbs);
	    }
	  }

	  VerbMethods.prototype.injectVerbMethods = function(path, obj) {
	    var allPromises, newPromise, ref1;
	    if (this._promisePlugin) {
	      ref1 = this._promisePlugin.promiseCreator, newPromise = ref1.newPromise, allPromises = ref1.allPromises;
	    }
	    obj.url = path;
	    forOwn(this._syncVerbs, (function(_this) {
	      return function(verbFunc, verbName) {
	        return obj[verbName] = function() {
	          var args, makeRequest;
	          args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
	          makeRequest = function() {
	            var cb, data, method, options, originalArgs, ref2;
	            cb = arguments[0], originalArgs = 2 <= arguments.length ? slice.call(arguments, 1) : [];
	            ref2 = verbFunc.apply(null, [path].concat(slice.call(originalArgs))), method = ref2.method, path = ref2.path, data = ref2.data, options = ref2.options;
	            return _this._requester.request(method, path, data, options, cb);
	          };
	          return toPromise(makeRequest, newPromise).apply(null, args);
	        };
	      };
	    })(this));
	    return forOwn(this._asyncVerbs, (function(_this) {
	      return function(verbFunc, verbName) {
	        return obj[verbName] = function() {
	          var args, makeRequest;
	          args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
	          makeRequest = verbFunc(_this._requester, path);
	          return toPromise(makeRequest, newPromise).apply(null, args);
	        };
	      };
	    })(this));
	  };

	  return VerbMethods;

	})();


/***/ },
/* 16 */
/***/ function(module, exports) {

	var toQueryString;

	toQueryString = function(options, omitQuestionMark) {
	  var key, params, ref, value;
	  if (!options || options === {}) {
	    return '';
	  }
	  params = [];
	  ref = options || {};
	  for (key in ref) {
	    value = ref[key];
	    if (value) {
	      params.push(key + "=" + (encodeURIComponent(value)));
	    }
	  }
	  if (params.length) {
	    if (omitQuestionMark) {
	      return "&" + (params.join('&'));
	    } else {
	      return "?" + (params.join('&'));
	    }
	  } else {
	    return '';
	  }
	};

	module.exports = toQueryString;


/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	var SimpleVerbs, toQueryString,
	  slice = [].slice;

	toQueryString = __webpack_require__(16);

	module.exports = new (SimpleVerbs = (function() {
	  function SimpleVerbs() {}

	  SimpleVerbs.prototype.verbs = {
	    fetch: function(path, query) {
	      return {
	        method: 'GET',
	        path: "" + path + (toQueryString(query))
	      };
	    },
	    read: function(path, query) {
	      return {
	        method: 'GET',
	        path: "" + path + (toQueryString(query)),
	        options: {
	          isRaw: true
	        }
	      };
	    },
	    remove: function(path, data) {
	      return {
	        method: 'DELETE',
	        path: path,
	        data: data,
	        options: {
	          isBoolean: true
	        }
	      };
	    },
	    create: function(path, data, contentType) {
	      if (contentType) {
	        return {
	          method: 'POST',
	          path: path,
	          data: data,
	          options: {
	            isRaw: true,
	            contentType: contentType
	          }
	        };
	      } else {
	        return {
	          method: 'POST',
	          path: path,
	          data: data
	        };
	      }
	    },
	    update: function(path, data) {
	      return {
	        method: 'PATCH',
	        path: path,
	        data: data
	      };
	    },
	    add: function(path, data) {
	      return {
	        method: 'PUT',
	        path: path,
	        data: data,
	        options: {
	          isBoolean: true
	        }
	      };
	    },
	    contains: function() {
	      var args, path;
	      path = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
	      return {
	        method: 'GET',
	        path: path + "/" + (args.join('/')),
	        options: {
	          isBoolean: true
	        }
	      };
	    }
	  };

	  return SimpleVerbs;

	})());


/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	var UseNativePromises;

	module.exports = new (UseNativePromises = (function() {
	  function UseNativePromises() {}

	  UseNativePromises.prototype.promiseCreator = __webpack_require__(19);

	  return UseNativePromises;

	})());


/***/ },
/* 19 */
/***/ function(module, exports) {

	var allPromises, newPromise;

	if (typeof Promise !== "undefined" && Promise !== null) {
	  newPromise = (function(_this) {
	    return function(fn) {
	      return new Promise(function(resolve, reject) {
	        if (resolve.fulfill) {
	          return fn(resolve.resolve.bind(resolve), resolve.reject.bind(resolve));
	        } else {
	          return fn.apply(null, arguments);
	        }
	      });
	    };
	  })(this);
	  allPromises = (function(_this) {
	    return function(promises) {
	      return Promise.all(promises);
	    };
	  })(this);
	}

	module.exports = {
	  newPromise: newPromise,
	  allPromises: allPromises
	};


/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	var require;var Requester, ajax, eventId, extend, filter, forEach, ref;

	ref = __webpack_require__(9), filter = ref.filter, forEach = ref.forEach, extend = ref.extend;

	ajax = function(options, cb) {
	  var XMLHttpRequest, name, ref1, req, value, xhr;
	  if (typeof window !== "undefined" && window !== null) {
	    XMLHttpRequest = window.XMLHttpRequest;
	  } else {
	    req = require;
	    XMLHttpRequest = __webpack_require__(21).XMLHttpRequest;
	  }
	  xhr = new XMLHttpRequest();
	  xhr.dataType = options.dataType;
	  if (typeof xhr.overrideMimeType === "function") {
	    xhr.overrideMimeType(options.mimeType);
	  }
	  xhr.open(options.type, options.url);
	  if (options.data && options.type !== 'GET') {
	    xhr.setRequestHeader('Content-Type', options.contentType);
	  }
	  ref1 = options.headers;
	  for (name in ref1) {
	    value = ref1[name];
	    xhr.setRequestHeader(name, value);
	  }
	  xhr.onreadystatechange = function() {
	    var name1, ref2;
	    if (4 === xhr.readyState) {
	      if ((ref2 = options.statusCode) != null) {
	        if (typeof ref2[name1 = xhr.status] === "function") {
	          ref2[name1]();
	        }
	      }
	      if (xhr.status >= 200 && xhr.status < 300 || xhr.status === 304 || xhr.status === 302) {
	        return cb(null, xhr);
	      } else {
	        return cb(xhr);
	      }
	    }
	  };
	  return xhr.send(options.data);
	};

	eventId = 0;

	module.exports = Requester = (function() {
	  function Requester(_instance, _clientOptions, plugins) {
	    var base, base1, base2;
	    this._instance = _instance;
	    this._clientOptions = _clientOptions != null ? _clientOptions : {};
	    if ((base = this._clientOptions).rootURL == null) {
	      base.rootURL = 'https://api.github.com';
	    }
	    if ((base1 = this._clientOptions).useETags == null) {
	      base1.useETags = true;
	    }
	    if ((base2 = this._clientOptions).usePostInsteadOfPatch == null) {
	      base2.usePostInsteadOfPatch = false;
	    }
	    if (typeof this._clientOptions.emitter === 'function') {
	      this._emit = this._clientOptions.emitter;
	    }
	    this._pluginMiddleware = filter(plugins, function(arg) {
	      var requestMiddleware;
	      requestMiddleware = arg.requestMiddleware;
	      return requestMiddleware;
	    });
	    this._plugins = plugins;
	  }

	  Requester.prototype.request = function(method, path, data, options, cb) {
	    var acc, ajaxConfig, headers, mimeType;
	    if (options == null) {
	      options = {
	        isRaw: false,
	        isBase64: false,
	        isBoolean: false,
	        contentType: 'application/json'
	      };
	    }
	    if (options == null) {
	      options = {};
	    }
	    if (options.isRaw == null) {
	      options.isRaw = false;
	    }
	    if (options.isBase64 == null) {
	      options.isBase64 = false;
	    }
	    if (options.isBoolean == null) {
	      options.isBoolean = false;
	    }
	    if (options.contentType == null) {
	      options.contentType = 'application/json';
	    }
	    if (!/^http/.test(path)) {
	      path = "" + this._clientOptions.rootURL + path;
	    }
	    headers = {
	      'Accept': this._clientOptions.acceptHeader || 'application/json'
	    };
	    if (typeof window === "undefined" || window === null) {
	      headers['User-Agent'] = 'octokat.js';
	    }
	    acc = {
	      method: method,
	      path: path,
	      headers: headers,
	      options: options,
	      clientOptions: this._clientOptions
	    };
	    forEach(this._pluginMiddleware, function(plugin) {
	      var mimeType, ref1;
	      ref1 = plugin.requestMiddleware(acc) || {}, method = ref1.method, headers = ref1.headers, mimeType = ref1.mimeType;
	      if (method) {
	        acc.method = method;
	      }
	      if (mimeType) {
	        acc.mimeType = mimeType;
	      }
	      return extend(acc.headers, headers);
	    });
	    method = acc.method, headers = acc.headers, mimeType = acc.mimeType;
	    if (options.isRaw) {
	      headers['Accept'] = 'application/vnd.github.raw';
	    }
	    ajaxConfig = {
	      url: path,
	      type: method,
	      contentType: options.contentType,
	      mimeType: mimeType,
	      headers: headers,
	      processData: false,
	      data: !options.isRaw && data && JSON.stringify(data) || data,
	      dataType: !options.isRaw ? 'json' : void 0
	    };
	    if (options.isBoolean) {
	      ajaxConfig.statusCode = {
	        204: (function(_this) {
	          return function() {
	            return cb(null, true);
	          };
	        })(this),
	        404: (function(_this) {
	          return function() {
	            return cb(null, false);
	          };
	        })(this)
	      };
	    }
	    eventId++;
	    if (typeof this._emit === "function") {
	      this._emit('start', eventId, {
	        method: method,
	        path: path,
	        data: data,
	        options: options
	      });
	    }
	    return ajax(ajaxConfig, (function(_this) {
	      return function(err, val) {
	        var emitterRate, jqXHR, json, rateLimit, rateLimitRemaining, rateLimitReset;
	        jqXHR = err || val;
	        if (_this._emit) {
	          if (jqXHR.getResponseHeader('X-RateLimit-Limit')) {
	            rateLimit = parseFloat(jqXHR.getResponseHeader('X-RateLimit-Limit'));
	            rateLimitRemaining = parseFloat(jqXHR.getResponseHeader('X-RateLimit-Remaining'));
	            rateLimitReset = parseFloat(jqXHR.getResponseHeader('X-RateLimit-Reset'));
	            emitterRate = {
	              remaining: rateLimitRemaining,
	              limit: rateLimit,
	              reset: rateLimitReset
	            };
	            if (jqXHR.getResponseHeader('X-OAuth-Scopes')) {
	              emitterRate.scopes = jqXHR.getResponseHeader('X-OAuth-Scopes').split(', ');
	            }
	          }
	          _this._emit('end', eventId, {
	            method: method,
	            path: path,
	            data: data,
	            options: options
	          }, jqXHR.status, emitterRate);
	        }
	        if (!err) {
	          if (jqXHR.status === 302) {
	            return cb(null, jqXHR.getResponseHeader('Location'));
	          } else if (!(jqXHR.status === 204 && options.isBoolean)) {
	            if (jqXHR.responseText && ajaxConfig.dataType === 'json') {
	              data = JSON.parse(jqXHR.responseText);
	            } else {
	              data = jqXHR.responseText;
	            }
	            acc = {
	              clientOptions: _this._clientOptions,
	              plugins: _this._plugins,
	              data: data,
	              options: options,
	              jqXHR: jqXHR,
	              status: jqXHR.status,
	              request: acc,
	              requester: _this,
	              instance: _this._instance
	            };
	            data = _this._instance._parseWithContext('', acc);
	            return cb(null, data, jqXHR.status, jqXHR);
	          }
	        } else {
	          if (options.isBoolean && jqXHR.status === 404) {

	          } else {
	            err = new Error(jqXHR.responseText);
	            err.status = jqXHR.status;
	            if (jqXHR.getResponseHeader('Content-Type') === 'application/json; charset=utf-8') {
	              if (jqXHR.responseText) {
	                json = JSON.parse(jqXHR.responseText);
	              } else {
	                json = '';
	              }
	              err.json = json;
	            }
	            return cb(err);
	          }
	        }
	      };
	    })(this));
	  };

	  return Requester;

	})();


/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var x;
	if (typeof window !== 'undefined') {
	  x = window.XMLHTTPRequest;
	} else {
	  x = __webpack_require__(21);
	}

	module.exports = x;

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	var deprecate, toQueryString,
	  slice = [].slice;

	toQueryString = __webpack_require__(16);

	deprecate = __webpack_require__(12);

	module.exports = function() {
	  var args, fieldName, fieldValue, i, j, k, len, len1, m, match, optionalNames, optionalParams, param, templateParams, url;
	  url = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
	  if (args.length === 0) {
	    templateParams = {};
	  } else {
	    if (args.length > 1) {
	      deprecate('When filling in a template URL pass all the field to fill in 1 object instead of comma-separated args');
	    }
	    templateParams = args[0];
	  }
	  i = 0;
	  while (m = /(\{[^\}]+\})/.exec(url)) {
	    match = m[1];
	    param = '';
	    switch (match[1]) {
	      case '/':
	        fieldName = match.slice(2, match.length - 1);
	        fieldValue = templateParams[fieldName];
	        if (fieldValue) {
	          if (/\//.test(fieldValue)) {
	            throw new Error("Octokat Error: this field must not contain slashes: " + fieldName);
	          }
	          param = "/" + fieldValue;
	        }
	        break;
	      case '+':
	        fieldName = match.slice(2, match.length - 1);
	        fieldValue = templateParams[fieldName];
	        if (fieldValue) {
	          param = fieldValue;
	        }
	        break;
	      case '?':
	        optionalNames = match.slice(2, -1).split(',');
	        optionalParams = {};
	        for (j = 0, len = optionalNames.length; j < len; j++) {
	          fieldName = optionalNames[j];
	          optionalParams[fieldName] = templateParams[fieldName];
	        }
	        param = toQueryString(optionalParams);
	        break;
	      case '&':
	        optionalNames = match.slice(2, -1).split(',');
	        optionalParams = {};
	        for (k = 0, len1 = optionalNames.length; k < len1; k++) {
	          fieldName = optionalNames[k];
	          optionalParams[fieldName] = templateParams[fieldName];
	        }
	        param = toQueryString(optionalParams, true);
	        break;
	      default:
	        fieldName = match.slice(1, match.length - 1);
	        if (templateParams[fieldName]) {
	          param = templateParams[fieldName];
	        } else {
	          throw new Error("Octokat Error: Required parameter is missing: " + fieldName);
	        }
	    }
	    url = url.replace(match, param);
	    i++;
	  }
	  return url;
	};


/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	var Authorization, base64encode;

	base64encode = __webpack_require__(24);

	module.exports = new (Authorization = (function() {
	  function Authorization() {}

	  Authorization.prototype.requestMiddleware = function(arg) {
	    var auth, password, ref, token, username;
	    ref = arg.clientOptions, token = ref.token, username = ref.username, password = ref.password;
	    if (token || (username && password)) {
	      if (token) {
	        auth = "token " + token;
	      } else {
	        auth = 'Basic ' + base64encode(username + ":" + password);
	      }
	      return {
	        headers: {
	          'Authorization': auth
	        }
	      };
	    }
	  };

	  return Authorization;

	})());


/***/ },
/* 24 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {var base64encode;

	if (typeof window !== "undefined" && window !== null) {
	  base64encode = window.btoa;
	} else if (typeof global !== "undefined" && global !== null ? global['Buffer'] : void 0) {
	  base64encode = function(str) {
	    var buffer;
	    buffer = new global['Buffer'](str, 'binary');
	    return buffer.toString('base64');
	  };
	} else {
	  throw new Error('Native btoa function or Buffer is missing');
	}

	module.exports = base64encode;

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	var CamelCase, plus;

	plus = __webpack_require__(9);

	module.exports = new (CamelCase = (function() {
	  function CamelCase() {}

	  CamelCase.prototype.responseMiddleware = function(arg) {
	    var data;
	    data = arg.data;
	    data = this.replace(data);
	    return {
	      data: data
	    };
	  };

	  CamelCase.prototype.replace = function(data) {
	    if (Array.isArray(data)) {
	      return this._replaceArray(data);
	    } else if (typeof data === 'function') {
	      return data;
	    } else if (data instanceof Date) {
	      return data;
	    } else if (data === Object(data)) {
	      return this._replaceObject(data);
	    } else {
	      return data;
	    }
	  };

	  CamelCase.prototype._replaceObject = function(orig) {
	    var acc, i, key, len, ref, value;
	    acc = {};
	    ref = Object.keys(orig);
	    for (i = 0, len = ref.length; i < len; i++) {
	      key = ref[i];
	      value = orig[key];
	      this._replaceKeyValue(acc, key, value);
	    }
	    return acc;
	  };

	  CamelCase.prototype._replaceArray = function(orig) {
	    var arr, i, item, key, len, ref, value;
	    arr = (function() {
	      var i, len, results;
	      results = [];
	      for (i = 0, len = orig.length; i < len; i++) {
	        item = orig[i];
	        results.push(this.replace(item));
	      }
	      return results;
	    }).call(this);
	    ref = Object.keys(orig);
	    for (i = 0, len = ref.length; i < len; i++) {
	      key = ref[i];
	      value = orig[key];
	      this._replaceKeyValue(arr, key, value);
	    }
	    return arr;
	  };

	  CamelCase.prototype._replaceKeyValue = function(acc, key, value) {
	    return acc[plus.camelize(key)] = this.replace(value);
	  };

	  return CamelCase;

	})());


/***/ },
/* 26 */
/***/ function(module, exports) {

	var CacheHandler;

	module.exports = new (CacheHandler = (function() {
	  function CacheHandler() {
	    this._cachedETags = {};
	  }

	  CacheHandler.prototype.get = function(method, path) {
	    return this._cachedETags[method + " " + path];
	  };

	  CacheHandler.prototype.add = function(method, path, eTag, data, status) {
	    return this._cachedETags[method + " " + path] = {
	      eTag: eTag,
	      data: data,
	      status: status
	    };
	  };

	  CacheHandler.prototype.requestMiddleware = function(arg) {
	    var cacheHandler, clientOptions, headers, method, path;
	    clientOptions = arg.clientOptions, method = arg.method, path = arg.path;
	    headers = {};
	    cacheHandler = clientOptions.cacheHandler || this;
	    if (cacheHandler.get(method, path)) {
	      headers['If-None-Match'] = cacheHandler.get(method, path).eTag;
	    } else {
	      headers['If-Modified-Since'] = 'Thu, 01 Jan 1970 00:00:00 GMT';
	    }
	    return {
	      headers: headers
	    };
	  };

	  CacheHandler.prototype.responseMiddleware = function(arg) {
	    var cacheHandler, clientOptions, data, eTag, jqXHR, method, path, ref, request, status;
	    clientOptions = arg.clientOptions, request = arg.request, status = arg.status, jqXHR = arg.jqXHR, data = arg.data;
	    if (!jqXHR) {
	      return;
	    }
	    if (jqXHR) {
	      method = request.method, path = request.path;
	      cacheHandler = clientOptions.cacheHandler || this;
	      if (status === 304) {
	        ref = cacheHandler.get(method, path), data = ref.data, status = ref.status;
	      } else {
	        if (method === 'GET' && jqXHR.getResponseHeader('ETag')) {
	          eTag = jqXHR.getResponseHeader('ETag');
	          cacheHandler.add(method, path, eTag, data, jqXHR.status);
	        }
	      }
	      return {
	        data: data,
	        status: status
	      };
	    }
	  };

	  return CacheHandler;

	})());


/***/ }
/******/ ]);