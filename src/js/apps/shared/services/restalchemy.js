"use strict";

/******************************************************************************************

Angular restalchemy Service

This service handles REST API calls, with auto-retries when networks are down or re-auth required

Usage:
	$restalchemy.at("vacancies", 23).get().then(callback).error(callback);

Makes a get request on the /vacancies/23 endpoint, calling one of two callbacks depending on success or failure


Usage:
	var rest = $restalchemy.init({ root: "/api" });
	rest.at("vacancies", 23, "lines").get().then(callback);

Makes a get request on /api/vacancies/23/lines endpoint, does nothing on an error

	rest.at("workers").get({ name: "pauline"}).then(callback);

Makes a get request on /api/workers?name=pauline endpoint, does nothing on an error

******************************************************************************************/

var app = angular.module("alchemytec.restalchemy", []);

app.factory("restalchemy", [ "$rootScope", "$http", "$q", "$timeout", function($rootScope, $http, $q, $timeout) {
	var syncConfig = [];
	var cacheConfig = [];
	var cacheList = {};
	var callList = {};
	var restId = 1;

	var sanitiseRestData = function(data) {
		var newdata = angular.copy(data);

		var items = newdata._items || newdata;

		if (newdata._info) {
			for (var key in newdata._info)
				items[key] = newdata._info[key];
		}

		return items;
	};

	// Search cache config for an endpoint match
	var getEndpointCacheInfo = function(root, endpoint) {
		var info = null;

		angular.forEach(cacheConfig, function(configLine) {
			angular.forEach(configLine.reEndpoints, function(regex, key) {
				if (endpoint.search(regex) != -1)
					info = configLine;
			});
		});

		return info;
	};

	// Search existing call list an endpoint match
	var isSynchronousEndpoint = function(root, endpoint) {
		var sync = null;

		angular.forEach(syncConfig, function(configLine) {
			angular.forEach(configLine.reEndpoints, function(regex, key) {
				if (endpoint.search(regex) != -1)
					sync = configLine;
			});
		});

		return sync;
	};

	// Invalidates any endpoints which match the current endpoint
	var invalidateCachedEndpoints = function(root, endpoint) {
		// Iterate the list of cache configs
		angular.forEach(cacheConfig, function(configLine) {

			// Iterate through the list of paths that can invalidate these endpoints
			angular.forEach(configLine.reInvalidators, function(regex) {
				if (endpoint.search(regex) != -1) {
					// Walk the list of cached endpoints
					angular.forEach(cacheList, function(cacheItem, key) {

						// Check each endpoint we marked as possible to invalidate
						angular.forEach(configLine.reEndpoints, function(regexEnd) {
							var endpoint = cacheItem.endpoint;

							// See if this endpoint matches one we are invalidating
							if (endpoint.search(regexEnd) != -1)
								delete cacheList[key];
						});
					});
				}
			});
		});
	};

	// Converts an endpoint array into a regular expression
	var makeEndpointRegex = function(endpointArray) {
		var regExArray = [ "^" ];

		if (_.isArray(endpointArray))
			endpointArray = endpointArray.join("/");

		endpointArray = endpointArray.split("/");

		while (endpointArray[0] == "")
			endpointArray.shift();

		angular.forEach(endpointArray, function(value) {
			if (value && _.isString(value)) {
				if ((value[0] == ":") || (value[0] == "{"))
					regExArray.push("[0-9]+");
				else if (value == "*")
					regExArray.push(".*?");
				else
					regExArray.push(value.replace(/\//g, "\\/"));
			}
			else
				console.log("Warning: endpoint includes invalid component", endpointArray);
		});

		var regString = regExArray.join("\\/") + "$";
		regString = regString.replace("\\/.*?", "(\\/.*?)?");

		return new RegExp(regString, "i");
	};

	// Get request with built in retry and error handling
	var httpGet = function($this, params) {
		var cacheName = buildCachedName($this.config.root, $this.endpoint, params, $this.config.headers);

		// Define some functions to handle success and error results for this call
		var successFunc = function(data, status) {
			if ($this.config.success)
				$this.config.success(sanitiseRestData(data), status);
		};

		var errorFunc = function(data, status) {
			if ($this.config.error)
				$this.config.error(data, status);
		};

		// Check if this call has been cached
		if (cacheList[cacheName]) {
			// Return a cache hit if this hasn't expired
			if (cacheList[cacheName].expires > new Date().getTime()) {
				if ($this.config.success)
					$this.config.success(sanitiseRestData(cacheList[cacheName].data), cacheList[cacheName].status);

				return;
			}
			else
				delete cacheList[cacheName];
		}

		// Check if we are already calling this endpoint with the same params elsewhere
		if (callList[cacheName]) {
			// Add our success/error callbacks to the call stack for this request
			callList[cacheName].callbacks.push({ success: successFunc, error: errorFunc });

			return;
		}
		else {
			// Look to see if this call is to a synchronous endpoint and should cancel others
			if (isSynchronousEndpoint($this.config.root, $this.endpoint)) {
				angular.forEach(callList, function(value, key) {
					if ((value.endpoint == $this.endpoint) && value.deferred) {
						// Terminate the rest call and delete the call list entry
						value.deferred.resolve();
						delete callList[key];
					}
				});
			}

			// Create a new entry in the call list
			callList[cacheName] = {
				id: restId++,
				start: new Date(),
				endpoint: $this.endpoint,
				params: params,
				callbacks: [],
				deferred: $q.defer()
			};

			// Add our success/error callbacks to the call stack for this request
			callList[cacheName].callbacks.push({ success: successFunc, error: errorFunc });
		}

		// Wrap the get call in a function so we can recall it from inside itself when a 500 occurs or auth is required
		var callGet = function() {
			$http.get($this.endpoint, { params: params, cache: false, responseType: "json", timeout: callList[cacheName].deferred.promise, headers: $this.config.headers }).success(function(data, status, headers, config) {
				// Look for a matching cache config for this endpoint
				var cacheInfo = getEndpointCacheInfo($this.config.root, $this.endpoint);

				if (cacheInfo) {
					var endpoint = $this.endpoint;

					// Store the cached data
					cacheList[cacheName] = {
						endpoint: endpoint,
						expires: new Date().getTime() + cacheInfo.timeout,
						data: angular.copy(data),
						status: status
					};
				}

				// Execute all success callbacks for this request
				angular.forEach(callList[cacheName].callbacks, function(callback) {
					callback.success(data, status);
				});

				// Delete this call entry list now its resolved
				delete callList[cacheName];
			}).error(function(data, status, headers, config) {
				// If status could be temporary, try again the right number of times
				if ((status > 500) && ($this.attempt < $this.config.retries)) {
					$this.attempt++;

					$timeout(function() {
						// Make sure this call hasn't been cancelled
						if (callList[cacheName]) {
							// Create a new promise as the old one has been resolved
							callList[cacheName].deferred = $q.defer();
							callGet();
						}
					}, $this.config.delay);
				}
				else if ((status == 401) && ($this.config.authenticate)) {
					$this.config.authenticate(function() {
						// Make sure this call hasn't been cancelled
						if (callList[cacheName]) {
							// Create a new promise as the old one has been resolved
							callList[cacheName].deferred = $q.defer();
							callGet();
						}
					}, function() {
						// Execute all error callbacks for this request
						angular.forEach(callList[cacheName].callbacks, function(callback) {
							callback.error(data, status);
						});

						// Delete this call entry list now its resolved
						delete callList[cacheName];
					});
				}
				// When status is zero or less this call was cancelled by the client side so don't process the call list
				else if (status > 0) {
					// Execute all error callbacks for this request
					angular.forEach(callList[cacheName].callbacks, function(callback) {
						callback.error(data, status);
					});

					// Delete this call entry list now its resolved
					delete callList[cacheName];
				}
			});
		};

		callGet();
	};

	// Post request with built in retry and error handling
	var httpPost = function($this, postdata, params) {
		var config = { params: params, responseType: "json" };

		if (postdata instanceof FormData)
			// do not override Content-Type for multi-part requests
			config.headers = { "Content-Type": undefined };
		else
			config.headers = {};

		angular.extend(config.headers, $this.config.headers);
		$http.post($this.endpoint, postdata, config).success(function(data, status, headers, config) {
			// Invalidate any cached data that matches this endpoint
			invalidateCachedEndpoints($this.config.root, $this.endpoint);

			if ($this.config.success)
				$this.config.success(data, status);
		}).error(function(data, status, headers, config) {
			// If status requires authentication trigger a login
			if ((status == 401) && ($this.config.authenticate)) {
				$this.config.authenticate(function() {
					httpPost($this, postdata, params);
				}, function() {
					if ($this.config.error)
						$this.config.error(data, status);
				});
			}
			else if ($this.config.error) {
				if ($this.config.error)
					$this.config.error(data, status);
			}
		});
	};

	// Put request with built in retry and error handling
	var httpPut = function($this, putdata, params) {
		$http.put($this.endpoint, putdata, { params: params, responseType: "json", headers: $this.config.headers }).success(function(data, status, headers, config) {
			// Invalidate any cached data that matches this endpoint
			invalidateCachedEndpoints($this.config.root, $this.endpoint);

			if ($this.config.success)
				$this.config.success(data, status);
		}).error(function(data, status, headers, config) {
			// Not modified isn't an error
			if (status == 304)
				$this.config.success(data, status);
			// If status requires authentication trigger a login
			else if ((status == 401) && ($this.config.authenticate)) {
				$this.config.authenticate(function() {
					httpPut($this, putdata, params);
				}, function() {
					if ($this.config.error)
						$this.config.error(data, status);
				});
			}
			else if ($this.config.error) {
				if ($this.config.error)
					$this.config.error(data, status);
			}
		});
	};

	// Delete request with built in retry and error handling
	var httpDelete = function($this, params) {
		$http.delete($this.endpoint, { params: params, responseType: "json", headers: $this.config.headers }).success(function(data, status, headers, config) {
			// Invalidate any cached data that matches this endpoint
			invalidateCachedEndpoints($this.config.root, $this.endpoint);

			if ($this.config.success)
				$this.config.success(data, status);
		}).error(function(data, status, headers, config) {
			// If status requires authentication trigger a login
			if ((status == 401) && ($this.config.authenticate)) {
				$this.config.authenticate(function() {
					httpDelete($this, params);
				}, function() {
					if ($this.config.error)
						$this.config.error(data, status);
				});
			}
			else if ($this.config.error) {
				if ($this.config.error)
					$this.config.error(data, status);
			}
		});
	};

	var buildCachedName = function(root, endpoint, params, headers) {
		var cachedName = endpoint.replace(/(^\/+|\/+$)/g, "");
		cachedName = "/" + cachedName;

		if (params) {
			// Remove any null/undefined params as they won't get passed on anyway
			var cachedParams = angular.copy(params);

			_.each(cachedParams, function(value, key) {
				if (_.isNull(value) || _.isUndefined(value))
					delete cachedParams[key];
			});

			// Make sure our params are consistently sorted
			var flatParams = _.flatten(_.sortBy(_.toPairs(cachedParams), function(value, key) {
				return value[0];
			})).join("+");

			cachedName += "?" + flatParams;
		}

		if (headers) {
			// Make sure our headers are consistently sorted
			var flatHeaders = _.flatten(_.sortBy(_.toPairs(headers), function(value, key) {
				return value[0];
			})).join("+");

			cachedName += "*" + flatHeaders;
		}

		return cachedName;
	};

	return {
		// Configuration settings
		config: {
			root: "/",
			retries: 2,
			delay: 3000,
			success: null,
			error: null,
			authenticate: null,
			timeout: null,
			headers: null
		},

		// Current endpoint
		endpoint: null,
		attempt: 0,

		// Create a unique copy of this service's settings
		init: function(config) {
			var $this = angular.copy(this);

			for (var key in config)
				$this.config[key] = config[key];

			return $this;
		},

		// Add paths to the endpoint
		at: function() {
			// Always return a copy of the object when changing the path
			var $this = angular.copy(this);
			$this.endpoint = this.config.root;

			// Check to see if substitution is required
			if (arguments.length && arguments[0].search("{") != -1) {
				var argCount = 1;

				$this.endpoint = $this.endpoint.replace(/\/?$/, "/") + arguments[0].replace(/(\{[^\}]+\})/g, ($0, $1) => {
					if (typeof arguments[argCount] == "undefined")
						throw ("Unable to construct REST call to endpoint " + arguments[0] + ", too few arguments specified");
					return arguments[argCount++];
				});
			}
			else {
				for (var u = 0; u < arguments.length; u++)
					$this.endpoint = $this.endpoint.replace(/\/?$/, "/") + arguments[u];
			}

			return $this;
		},

		// Get from the current endpoint
		get: function(params) {
			var $this = this;

			// Allow the calling function to get on with things
			$timeout(function() {
				httpGet($this, params);
			}, 0);

			return this;
		},

		// Post data to the current endpoint
		post: function(data, params) {
			var $this = this;

			$timeout(function() {
				httpPost($this, data, params);
			}, 0);

			return this;
		},

		put: function(data, params) {
			var $this = this;

			$timeout(function() {
				httpPut($this, data, params);
			}, 0);

			return this;
		},

		delete: function(params) {
			var $this = this;

			$timeout(function() {
				httpDelete($this, params);
			}, 0);

			return this;
		},

		// Set the success callback, which receives (data, status) params
		then: function(callback) {
			this.config.success = callback;

			return this;
		},

		// Set the error callback, which receives (data, status) params
		error: function(callback) {
			this.config.error = callback;

			return this;
		},

		// Set the authentication callback, which receives (authenticated, error) and should call one of them as a callback
		authenticate: function(callback) {
			this.config.authenticate = callback;

			return this;
		},

		// Adds a custom header or headers
		header: function(newheader) {
			this.config.headers = this.config.headers || {};

			if (_.isString(newheader))
				this.config.headers[newheader] = true;
			else if (_.isObject(newheader)) {
				angular.extend(this.config.headers, newheader);
				this.config.headers = _.omitBy(this.config.headers, _.isNull);
			}

			return this;
		},

		// Add configuration for caching endpoints
		addCache: function(cacheInfo) {
			cacheInfo = angular.copy(cacheInfo);
			cacheInfo.reEndpoints = [];
			cacheInfo.reInvalidators = [];

			// Convert array based endpoints into regexs
			angular.forEach(cacheInfo.endpoints, function(value) {
				cacheInfo.reEndpoints.push(makeEndpointRegex(value));
			});
			angular.forEach(cacheInfo.invalidators, function(value) {
				cacheInfo.reInvalidators.push(makeEndpointRegex(value));
			});

			cacheConfig.push(cacheInfo);
		},

		// Add configuration for forcing endpoints synchronous
		addSync: function(syncInfo) {
			syncInfo = angular.copy(syncInfo);
			syncInfo.reEndpoints = [];

			// Convert array based endpoints into regexs
			angular.forEach(syncInfo.endpoints, function(value) {
				syncInfo.reEndpoints.push(makeEndpointRegex(value));
			});

			syncConfig.push(syncInfo);
		},

		// Invalidate any endpoints that a CUD on the provided one would affect
		invalidateFromEndpoint: function(endpoint) {
			invalidateCachedEndpoints("", endpoint);
		},

		// Invalidate the entire cache
		invalidateCache: function() {
			cacheList = {};
		}
	};
}]);
