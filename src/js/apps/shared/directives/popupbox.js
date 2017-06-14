/******************************************************************************************

Angular popupbox Directive

This directive adds a popup popupbox to an element

Usage: <span at-popupbox=" 'worker-popup.html' " at-position="above" at-anchor="left">Brian O'Hanrohanrohan</span>
	this will popup a view when the above name is clicked above the element anchored with the bottom left corner

******************************************************************************************/

var app = angular.module("alchemytec.popupbox", []);

app.directive("atPopupbox", ["$rootScope", "$timeout", "$animate", "$compile", "$templateCache", function($rootScope, $timeout, $animate, $compile, $templateCache) {
	var uniqueId = 1;
	var popupType = "popupbox";
	var $window = angular.element(window);
	var $body = angular.element("body");
	var delayTimeout = 10000;
	var activePopups = [];

	var resizer = resizeDetector({
		strategy: "scroll"
	});

	var link = function($scope, element, attrs, ngModel) {
		var thisId = uniqueId++;
		var popupPosition = attrs.atPosition || "below";
		var popupAnchor = attrs.atAnchor || "center";
		var popupHover = attrs.atHover || false;
		var popupHoverDelay = (attrs.atHoverDelay || 0) * 1000;
		var popupDisable = attrs.atPopupDisable;
		var popupData = attrs.atPopupData;
		var hoverTimeout = null;
		var popupClass = attrs.atClass ? (" " + attrs.atClass) : "";
		var popupDontHide = (attrs.atDonthidelist || "").split(",");
		var popupMobileWidth = attrs.atMobileWidth || 320;
		var popupElement = angular.element("<div class='box-popup popup-" + popupPosition + " popup-" + popupAnchor + popupClass + "'></div>");
		var popupReady = attrs.atReady || true;
		var lastTemplate = null;
		var waitForReady = null;

		angular.element("body").append(popupElement);
		popupElement.hide();

		var hidePopup = function() {
			if (popupElement.hasClass("animate-fade")) {
				_.pull(activePopups, hidePopup);
				$timeout(function() {
					$animate.removeClass(popupElement, "animate-fade").then(function() {
						$rootScope.$broadcast("closing-popup", { type: popupType, id: thisId, name: attrs.name });
					});
				});
			}
		};

		$window.click(hidePopup);

		// Tidy up our window listeners
		element.on("$destroy", function() {
			$window.unbind("click", hidePopup);
			$window.unbind("resize", positionPopup);
			resizer.removeListener(element[0], positionPopup);
			resizer.removeListener(popupElement[0], positionPopup);
			popupElement.remove();
		});

		popupElement.click(function(event) {
			event.stopPropagation();
		});

		// Do not add clickable classes to inputs! They make them non-selectable
		if (element.prop("tagName") != "INPUT")
			element.addClass("clickable");

		var positionPopup = function() {
			var elementPos = element.offset();

			// Get popup dimensions
			var popWidth = popupElement.outerWidth();
			var popHeight = popupElement.outerHeight();

			switch (popupPosition) {
				case "below":
					elementPos.top += element.outerHeight() + 15;
					break;
				case "above":
					elementPos.top -= popHeight + 15;
			}

			switch (popupAnchor) {
				case "center":
					elementPos.left += Math.floor(element.outerWidth() / 2) - Math.floor(popWidth / 2);
					break;
				case "left":
					break;
				case "right":
					elementPos.left -= popWidth - element.outerWidth();
			}

			// Make sure it fits on screen
			var windowWidth = $window.width();
			if ((elementPos.left + popWidth) > windowWidth)
				elementPos.left = windowWidth - popWidth - 10;
			if (elementPos.left < 1)
				elementPos.left = 1;

			if (elementPos.top < 10) {
				popupElement.css({ height: (popHeight + elementPos.top) + "px" });
				elementPos.top = 10;
			}

			popupElement.css({ top: elementPos.top + "px", left: elementPos.left + "px" });
		};

		var showPopup = function() {
			// Temporarily disable the popup if required
			if (popupDisable && $scope.$eval(popupDisable))
				return;

			if ((attrs.atPopupboxMobile) && ($window.width() <= popupMobileWidth))
				var newTemplate = $scope.$eval(attrs.atPopupboxMobile);
			else
				newTemplate = $scope.$eval(attrs.atPopupbox);

			// Display the popup function
			var positionAndShow = () => {
				popupElement.show();
				positionPopup();
				popupElement.hide();

				$animate.addClass(popupElement, "animate-fade");

				// automatically remove active popups
				_.forEach(activePopups, (hide) => hide());

				// only register popups for removal when they are triggered by a hover event
				if (popupHover)
					activePopups.push(hidePopup);
			};

			if (popupData)
				$scope.popupData = $scope.$eval(popupData);

			if (lastTemplate != newTemplate) {
				// Empty our element
				popupElement.empty();

				waitForReady = $scope.$eval(attrs.atWaitforready);

				// See if we should be delaying showing this popup
				if (waitForReady) {
					// Let the user know we are loading something
					$body.addClass("busy");

					var readyTimeout = $timeout(() => {
						// Show anyway
						$body.removeClass("busy");
						positionAndShow();
						waitForReady = null;

						console.log("WARNING: Popupbox controller did not emit view-ready event after " + delayTimeout / 1000 + " seconds");

						// Make sure we don't wait for a new ready event until the dialog is shown again
						readyEvent();
					}, delayTimeout);

					var readyEvent = $scope.$on("view-ready", (event) => {
						// When a show event is triggered, should prevent this going any higher and triggering parents
						// to be ready when they may not be
						event.stopPropagation();

						// Make sure the show timeout doesn't happen
						$timeout.cancel(readyTimeout);

						// Push showing the dialog out of the current event loop so it isn't shown twice
						$timeout(() => {
							$body.removeClass("busy");
							positionAndShow();
							waitForReady = null;
						});

						// Make sure we don't wait for a new ready event until the template is recompiled
						readyEvent();
					});
				}

				// Include the new template and compile it
				popupElement.append(angular.element($templateCache.get(newTemplate)));
				$compile(popupElement.contents())($scope);
				lastTemplate = newTemplate;
			}

			// Set up resizes for the popup
			resizer.listenTo(element[0], positionPopup);
			resizer.listenTo(popupElement[0], positionPopup);
			$window.resize(positionPopup);

			// Show the popup immediately if we aren't delaying it
			if (!waitForReady) {
				// Give Angular a chance to compile and render the popup content
				$scope.$evalAsync(() => {
					$timeout(positionAndShow, 100);
				});
			}

			// Because the mouse can trigger a popup and close a DDL by accident we don't close things on hover
			if (!popupHover)
				$rootScope.$broadcast("opening-popup", { type: popupType, id: thisId, name: attrs.name });
		};

		if (popupHover) {
			element.hover(function(event) {
				// We need to debounce the popup to allow for a hover delay
				hoverTimeout = $timeout(function() {
					showPopup();
				}, popupHoverDelay);
			}, function(event) {
				if (hoverTimeout) {
					$timeout.cancel(hoverTimeout);
					hoverTimeout = null;
				}

				hidePopup();
			});
		}
		else {
			element.click(function(event) {
				event.preventDefault();
				event.stopPropagation();

				// If the menu element exists, fade it out and stop here
				if (popupElement.is(":visible"))
					hidePopup();
				else
					showPopup();
			});
		}

		popupElement.click(function() {
			$rootScope.$broadcast("opening-popup", { type: popupType, id: thisId, name: attrs.name });
		});

		$scope.$on("opening-popup", function(event, source) {
			if ((source.type != popupType) || (source.id != thisId)) {
				for (var u = 0; u < popupDontHide.length; u++) {
					// If this popup's name matches our dont hide list, then dont hide!
					if (source.name && (source.name == popupDontHide[u]))
						return;
				}
				hidePopup();
			}
		});
	};

	return {
		restrict: "A",
		link: link
	};
}]);
