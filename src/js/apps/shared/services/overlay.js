"use strict";

/******************************************************************************************

Angular overlay Service

This service handles a global busy overlay

******************************************************************************************/

var app = angular.module("alchemytec.overlay", [ "alchemytec.spinnything" ]);

app.factory("overlay", [ "$rootScope", "$timeout", "$animate", function($rootScope, $timeout, $animate) {
	var uniqueId = 1;
	var showList = [];
	var overlay = angular.element("<div class='overlay global'><div class='backdrop'></div></div>");
	var closePromise = null;
	var fadeInTimer = null;
	var fadeInTime = 0;

	angular.element("body").append(overlay);
	overlay.hide();

	overlay.click(function() {
		$rootScope.$broadcast("overlay-clicked");
	});

	var addOverlay = function(name, timeout, classname, delay, minimum) {
		var event = {
			id: uniqueId++,
			name: name,
			classname: classname,
			timeout: timeout,
			started: new Date(),
			delay: delay,
			minimum: minimum || 0
		};

		if (_.isObject(name))
			angular.extend(event, name);

		showList.push(event);

		if (timeout) {
			$timeout(function() {
				removeOverlay(event.id);
			}, timeout);
		}

		showHideOverlay();

		return event.id;
	};

	var removeOverlay = function(event) {
		// Remove overlay from the list
		if (_.isString(event)) {
			for (var u = 0; u < showList.length; u++) {
				if (showList[u].name == event) {
					showList.splice(u, 1);
					break;
				}
			}
		}
		else {
			for (u = 0; u < showList.length; u++) {
				if (showList[u].id == event) {
					showList.splice(u, 1);
					break;
				}
			}
		}

		showHideOverlay();
	};

	var clearAllOverlays = function() {
		// Clear the overlay list
		showList = [];
		// Trigger the hiding of any current overlays
		showHideOverlay();
	};

	// Shows the first overlay in the list
	var showHideOverlay = function() {
		// See if we need to show the array
		if (showList.length && !closePromise) {
			var isVisible = overlay.is(":visible");
			var event = _.last(showList);

			// Make sure only the required classes exist
			overlay.attr("class", "overlay global" + (isVisible ? " animate-fade" : ""));

			if (event.classname)
				overlay.addClass(event.classname);

			// Show if not visible
			if (!isVisible) {
				// make sure we enable the overlay (invisible) immediately to block user interaction
				overlay.css({ display: "block", opacity: 0 });

				var fadeIn = () => {
					fadeInTimer = null;
					fadeInTime = new Date().getTime();
					fadeInTime += 1000 * ((event.delay || 0) + 0.2);
					fadeInTime += event.minimum * 1000;
					
					$animate.addClass(overlay, "animate-fade");
				};

				if (event.delay)
					fadeInTimer = $timeout(fadeIn, event.delay * 1000);
				else
					fadeIn();
			}
		}
		// Only hide if visible and not in the process of closing already
		else if (overlay.is(":visible") && !closePromise) {
			if (fadeInTimer) {
				$timeout.cancel(fadeInTimer);
				fadeInTimer = null;
			}

			var fadeOut = () => {
				closePromise = $animate.removeClass(overlay, "animate-fade");
				closePromise.then(function() {
					closePromise = null;
					overlay.css({ display: "none" });

					// check to see if we need a new overlay
					showHideOverlay();
				});
			};

			// Ensure that the overlay has been visible for at least a minimum period of time
			var now = new Date().getTime();

			if (now >= fadeInTime)
				fadeOut();
			else
				$timeout(fadeOut, fadeInTime - now);
		}
	};

	return {
		show: addOverlay,
		hide: removeOverlay,
		clear: clearAllOverlays
	};
}]);

app.factory("overlayspinner", [ "$rootScope", "$timeout", "$animate", "$compile", function($rootScope, $timeout, $animate, $compile) {
	var uniqueId = 1;
	var showList = [];
	var overlaySpinner = angular.element("<div class='spinner global'><at-spinny-thing at-size='large'></div>");
	var $body = angular.element("body");
	var fadeInTimer = null;
	var fadeInTime = 0;

	$body.append(overlaySpinner);
	$compile(overlaySpinner.contents())($rootScope);
	overlaySpinner.hide();

	var addOverlaySpinner = function(name, timeout, delay, minimum) {
		var event = {
			id: uniqueId++,
			name: name,
			timeout: timeout,
			started: new Date(),
			delay: delay,
			minimum: minimum || 0
		};
		if (_.isObject(name))
			angular.extend(event, name);

		showList.push(event);

		if (event.timeout) {
			$timeout(function() {
				removeOverlaySpinner(event.id);
			}, event.timeout);
		}

		if (event.delay)
			fadeInTimer = $timeout(showHideOverlaySpinner, event.delay * 1000);
		else
			showHideOverlaySpinner();

		// Show a spinning cursor
		$body.addClass("busy");
	
		return event.id;
	};

	var removeOverlaySpinner = function(event) {
		// Remove overlay spinner from the list
		if (_.isString(event)) {
			for (var u = 0; u < showList.length; u++) {
				if (showList[u].name == event) {
					showList.splice(u, 1);
					break;
				}
			}
		}
		else {
			for (u = 0; u < showList.length; u++) {
				if (showList[u].id == event) {
					showList.splice(u, 1);
					break;
				}
			}
		}

		showHideOverlaySpinner();
	};

	var clearAllOverlaySpinners = function() {
		// Clear the overlay spinner list
		showList = [];
		// Trigger the hiding of any current overlay spinners
		showHideOverlaySpinner();
	};

	// Shows the first overlay spinner in the list
	var showHideOverlaySpinner = function() {
		// See if we need to show the array
		if (showList.length) {
			var isVisible = overlaySpinner.is(":visible");
			var event = _.last(showList);

			// Only show if not visible
			if (!isVisible) {
				$animate.addClass(overlaySpinner, "animate-fade");

				fadeInTime = new Date().getTime();
				fadeInTime += 1000 * ((event.delay || 0) + 0.2);
				fadeInTime += event.minimum * 1000;
			}
		}
		else {
			if (fadeInTimer) {
				$timeout.cancel(fadeInTimer);
				fadeInTimer = null;
			}

			var fadeOut = () => {
				$animate.removeClass(overlaySpinner, "animate-fade");
			};

			// Ensure that the overlay has been visible for at least a minimum period of time
			var now = new Date().getTime();
			
			if (now >= fadeInTime)
				fadeOut();
			else
				$timeout(fadeOut, fadeInTime - now);
			
			// Remove the spinning cursor
			$body.removeClass("busy");
		}
	};

	return {
		show: addOverlaySpinner,
		hide: removeOverlaySpinner,
		clear: clearAllOverlaySpinners
	};
}]);
