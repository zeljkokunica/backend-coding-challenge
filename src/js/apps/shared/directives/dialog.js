"use strict";

/******************************************************************************************

Angular dialog Directive

This directive turns an element into a dialog box

Usage: <div at-dialog at-close-icon="true" at-disable-close="true" at-overlay="dark">Go west? <button ng-click="closeDialog">Yes</button> or <button>No</button></div>
	this will show the div in a dialog which can't be closed by clicking the overlay but has a close button

******************************************************************************************/

var app = angular.module("alchemytec.dialog", []);

app.directive("atDialog", ["$rootScope", "$timeout", "$animate", "$compile", "$templateCache", "overlay", function($rootScope, $timeout, $animate, $compile, $templateCache, $overlay) {
	var $window = angular.element(window);
	var $body = angular.element("body");
	var uniqueId = 1;
	var scrollTopTarget = null;
	var openCount = 0;
	var delayTimeout = 10000;

	var resizer = resizeDetector({
		strategy: "scroll"
	});

	var link = function($scope, element, attrs) {
		var closeIcon = angular.element("<div class='icon close clickable'></div>");
		var closeEvent = attrs.atCloseEvent || "close-dialog";
		var destroyEvent = attrs.atDestroyEvent || "destroy-dialog";
		var dontFocus = attrs.atDontFocus || false;
		var srcInclude = attrs.atInclude;
		var stopOverlayListener = null;
		var scrollTop = 0;
		var thisId = uniqueId++;
		var isClosing = false, isReopening = false;

		// Move the dialog element outside the body and hide it if required
		if (!element.parent().is("body"))
			$body.append(element);
		element.hide();

		element.addClass("dialog");
		var eleTop = parseInt(element.css("top"), 10);

		// Stop clicks inside this dialog propagating to the overlay
		// and clicks on the dialog close popups
		element.click(function(event) {
			event.stopPropagation();
			$rootScope.$broadcast("opening-popup", { type: null, id: null });
		});

		// Bindable trigger close event function
		var clickFunc = function(event) {
			event.stopPropagation();
			$timeout(function() {
				$scope.$emit(closeEvent);
			}, 0);
		};

		// Listen for clicking on the overlay to close
		if (attrs.atDisableClose != "true") {
			stopOverlayListener = $rootScope.$on("overlay-clicked", function() {
				$scope.$emit(closeEvent);
			});
		}

		// Show the dialog
		var showDialog = function() {
			var waitForReady = $scope.$eval(attrs.atWaitforready);

			// See if we need to postpone this and reopen it once the dialog is hidden
			if (isClosing) {
				isReopening = true;
				return;
			}
			else
				isReopening = false;

			// Add a close icon if required
			if (attrs.atCloseIcon == "true") {
				element.prepend(closeIcon);
				closeIcon.click(clickFunc);
			}

			var positionAndShow = () => {
				// Move the top based on window scrolling (or where it will be if we are returning back to it)
				if (scrollTopTarget != null)
					element.css({ top: (eleTop + scrollTopTarget + (openCount * 20)) + "px" });
				else
					element.css({ top: (eleTop + $window.scrollTop() + (openCount * 20)) + "px" });

				// If either the window or content changes size, recenter dialog
				resizer.listenTo(element[0], centerDialog);
				$window.resize(centerDialog);

				// Ensure the dialog is visible so we can center it correctly
				element.show();
				centerDialog();
				element.hide();

				// Fade in the dialog
				$animate.addClass(element, "animate-fade").then(function() {
					// Get the window scroll position for when we come to close this dialog
					scrollTop = $body.scrollTop();

					// Give focus to the first input or text area in the dialog
					if (!dontFocus)
						element.find("input,textarea").first().click();
				});

				// Fade in the overlay
				switch (attrs.atOverlay) {
					case "off":
						break;
					case "dark":
						$overlay.show("dialog-" + thisId, null, "dialog-overlay dark");
						break;
					case "transparent":
						$overlay.show("dialog-" + thisId, null, "dialog-overlay transparent");
						break;
					default:
						$overlay.show("dialog-" + thisId, null, "dialog-overlay");
				}

				// Move the top based on window scrolling
				element.css({ top: eleTop + $window.scrollTop() + "px" });
			};

			// See if we should be delaying showing this dialog
			if (waitForReady) {
				// Let the user know we are loading something
				$body.addClass("busy");

				var readyTimeout = $timeout(() => {
					// Show anyway
					$body.removeClass("busy");
					positionAndShow();

					console.log("WARNING: Dialog controller did not emit view-ready event after " + delayTimeout / 1000 + " seconds");

					// Make sure we don't wait for a new ready event until the dialog is shown again
					readyEvent();
				}, delayTimeout);

				var readyEvent = $scope.$on("view-ready", (event) => {
					// When a show event is triggered, should prevent this going any higher and triggering parents
					// to be ready when they may not be
					event.stopPropagation();

					// Make sure the show timeout doesn't happen
					$timeout.cancel(readyTimeout);

					// Push showing the dialog out of the current event loop in case this is shown before the DOM
					// is updated
					$scope.$evalAsync(function() {
						$timeout(() => {
							$body.removeClass("busy");
							positionAndShow();
						}, 100);
					});

					// Make sure we don't wait for a new ready event until the dialog is shown again
					readyEvent();
				});
			}

			if (srcInclude) {
				var contents = angular.element($templateCache.get($scope.$eval(srcInclude)));
				$compile(contents)($scope);
				element.append(contents);
			}
			else
				$compile(element.contents())($scope);

			// Show the dialog immediately if we aren't delaying it
			if (!waitForReady) {
				// Give Angular a chance to compile and render the dialog content
				$scope.$evalAsync(function() {
					$timeout(positionAndShow, 100);
				});
			}
		};

		// Hide the dialog
		var hideDialog = function() {
			if (element.is(":visible")) {
				// Return the window scroll position to it's pre-dialog state
				scrollTopTarget = scrollTop;
				$body.animate({ scrollTop: scrollTop }, 500, function() {
					scrollTopTarget = null;
				});

				// Track the closing of this dialog in case it is opened again before it's invisible
				isClosing = true;

				// Make sure any controls that are showing get instantly hidden to prevent them from ruining fade animations
				$rootScope.$broadcast("quick-hide-popups");
				$rootScope.$broadcast("quick-hide-subdialogs");

				// Fade out the dialog itself
				$animate.removeClass(element, "animate-fade").then(function() {
					// Allow the element ot be
					isClosing = false;

					// Included templates should be emptied
					if (srcInclude)
						element.empty();

					// Reopen the dialog now if required
					if (isReopening)
						showDialog();
					else
						// Emit a closed dialog event in case the DOM element should be destroyed
						$scope.$emit(destroyEvent);
				});

				// Hide the overlay
				$overlay.hide("dialog-" + thisId);

				unbindEvents();
			}
		};

		// Watch a var for showing or hiding
		$scope.$watch(attrs.atDialog, function(newValue, oldValue) {
			if (newValue && !oldValue) {
				showDialog();
				openCount++;
			}
			else if (oldValue) {
				hideDialog();
				openCount--;
			}
		});

		// Handle centering the dialog when the contents or window size change
		var centerDialog = function(event) {
			var position = element.offset();
			var windowWidth = $window.outerWidth();

			if (windowWidth > 600)
				element.css({ "max-width": (windowWidth - 60) + "px" });
			else if (windowWidth > 400)
				element.css({ "max-width": (windowWidth - 20) + "px" });
			else
				element.css({ "max-width": "none" });

			$timeout(function() {
				position.left = Math.floor((windowWidth - element.outerWidth()) / 2);

				if (position.left < 0)
					position.left = 0;

				element.css({ left: position.left + "px" });
			});
		};

		// Tidy up our various close listeners
		var unbindEvents = function() {
			if (stopOverlayListener)
				stopOverlayListener();

			$window.unbind("click", clickFunc);

			resizer.removeListener(element[0], centerDialog);
			$window.unbind("resize", centerDialog);
		};

		// Tidy up our listeners if the element itself is destroyed
		element.on("$destroy", function() {
			unbindEvents();
		});
	};

	return {
		restrict: "A",
		terminal: true,
		scope: false,
		priority: 1000,
		link: link
	};
}]);
