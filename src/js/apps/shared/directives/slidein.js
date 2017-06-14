/******************************************************************************************

Angular slidein Directive

This directive makes a fixed element visible when the page scrolls down

Usage: <div at-slidein min-scroll="50" slide-direction="down" slide-delay="50" slide-speed="250" class="fixed-menu">Hi there</div>
	this will slide down the div with an animation time of 250ms when the window is scrolled down by 50 pixels,
	delaying the initial animation by 50ms

Any elements inside a slidein element may also contain slide-direction attributes, and will be slid-in when the top animation is complete

******************************************************************************************/

var app = angular.module("alchemytec.slidein", []);

app.directive("atSlidein", ["$timeout", function($timeout) {
	var getHidePos = function(element, direction) {
		var hidePos = { };
		var eleWidth = element.element.outerWidth() + 10;
		var eleHeight = element.element.outerHeight() + 10;

		// Set the hidden position based on the slide direction
		switch (direction) {
			case "right":
				hidePos.left = element.left - eleWidth;
				break;
			case "left":
				hidePos.right = element.right - eleWidth;
				break;
			case "up":
				hidePos.bottom = element.bottom - eleHeight;
				break;
			case "down":
				hidePos.top = element.top - eleHeight;
				break;
			default:
				break;
		}

		return hidePos;
	};

	var getAnimateVars = function(element, direction) {
		// Make sure we only animate the minimum of values
		switch (direction) {
			case "right":
				return { left: element.left + "px" };
			case "left":
				return { right: element.right + "px" };
			case "up":
				return { bottom: element.bottom + "px" };
			case "down":
				return { top: element.top + "px" };
		}

		return {};
	};

	var getElementVars = function(element, slideDirection, slideSpeed, slideDelay) {
		var top = element.css("top");
		var right = element.css("right");
		var bottom = element.css("bottom");
		var left = element.css("left");

		return {
			element: element,
			top: (top == "auto") ? null : parseInt(top, 10),
			right: (right == "auto") ? null : parseInt(right, 10),
			bottom: (bottom == "auto") ? null : parseInt(bottom, 10),
			left: (left == "auto") ? null : parseInt(left, 10),
			direction: slideDirection || "down",
			speed: parseInt(slideSpeed || 250, 10),
			delay: parseInt(slideDelay || 0, 10)
		};
	};

	var link = function($scope, element, attrs, ngModel) {
		var minScroll = $scope.$eval(attrs.atMinScroll) || 60;
		var $window = angular.element(window);
		var $body = angular.element("body");
		var elements = [];
		var visible = false;

		// Setup the initial elements list
		var setupElements = function() {
			// Get the element position and size
			element.show();

			// Store the initial positions
			elements.push(getElementVars(element, attrs.atSlideDirection, attrs.atSlideSpeed, attrs.atSlideDelay));

			// Find any child elements that require sliding
			element.find("[slide-direction]").each(function() {
				var $this = angular.element(this);

				$this.show();
				elements.push(getElementVars($this, $this.attr("slide-direction"), $this.attr("slide-speed"), $this.attr("slide-delay")));
			});

			// Set initial hidden positions of all objects
			for (var u = 0; u < elements.length; u++) {
				var eleHidePos = getHidePos(elements[u], elements[u].direction);
				var newCSS = getAnimateVars(eleHidePos, elements[u].direction);

				for (var key in newCSS)
					elements[u].element.css(key, newCSS[key]);
			}
		};

		// Watch for any changes in our minimum scroll values
		if (attrs.atMinScroll) {
			$scope.$watch(attrs.atMinScroll, function(newValue, oldValue) {
				minScroll = parseInt(newValue, 10) || 60;
			});
		}

		// Update element visibilities
		var showHide = function(event) {
			if (!elements.length)
				return;

			if (attrs.atHide)
				var forceHide = $scope.$eval(attrs.atHide);
			else
				forceHide = false;

			// Only show the element if we haven't already
			if (!visible && !forceHide && ($window.scrollTop() > minScroll)) {
				visible = true;

				// Ensure no other animations are in progress
				elements[0].element.stop();

				// Trigger the main animation
				$timeout(function() {
					elements[0].element.animate(getAnimateVars(elements[0], elements[0].direction), elements[0].speed, function() {
						// Trigger any child animations once the main is complete
						for (var u = 1; u < elements.length; u++) {
							(function(index) {
								$timeout(function() {
									elements[index].element.animate(getAnimateVars(elements[index], elements[index].direction), elements[index].speed);
								}, elements[index].delay);
							})(u);
						}
					});
				}, elements[0].delay);
			}
			else if (visible && (($window.scrollTop() <= minScroll) || forceHide)) {
				visible = false;

				// Trigger any child animations once the main is complete
				for (var u = 0; u < elements.length; u++) {
					(function(index) {
						$timeout(function() {
							// Ensure no other animations are in progress
							elements[index].element.stop();
							var eleHidePos = getHidePos(elements[index], elements[index].direction);

							elements[index].element.animate(getAnimateVars(eleHidePos, elements[index].direction), elements[index].speed);
						}, elements[index].delay);
					})(u);
				}
			}
		};

		// Initialise our element list
		setupElements();

		// Watch for a scroll event
		$window.on("scroll", showHide);
		$window.bind("touchmove", showHide);

		// Tidy up our window listeners
		element.on("$destroy", function() {
			$window.unbind("scroll", showHide);
			$window.unbind("touchmove", showHide);
		});
	};

	return {
		restrict: "A",
		link: link
	};
}]);
