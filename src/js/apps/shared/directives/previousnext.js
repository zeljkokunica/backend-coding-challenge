"use strict";

/******************************************************************************************

Angular previous next Directive

This directive adds previous and next navigation hovering block elements

Usage: <at-previous-next at-next-text=" 'Next timesheet' " at-next="nextTimesheet()" at-previous="prevTimesheet()" at-previous-text=" 'Previoustimesheet' " ></at-previous-next>
	this will show nextTimesheet and prevTimesheet scope variables over the
	parent element whenever the mouse is moved or screen touched

******************************************************************************************/

var app = angular.module("alchemytec.previousnext", []);

app.directive("atPreviousNext", ["$rootScope", "$compile", "$timeout", "$animate", function($rootScope, $compile, $timeout, $animate) {
	var $window = angular.element(window);
	var $body = angular.element("body");
	var showTime = 2000;

	var resizer = resizeDetector({
		strategy: "scroll"
	});

	var link = function($scope, element, attrs) {
		var showTimeout = null;
		var $dialog = null;
		var lastX = 0;
		var lastY = 0;

		var divPrevious = angular.element("<div at-fixed class='previous-block'></div>");
		divPrevious.attr("ng-click", attrs.atPrevious);
		var divPrevBackdrop = angular.element("<div class='backdrop'></div>");
		var divPrevText = angular.element("<div class='label'></div>");
		divPrevText.text("{{ " + attrs.atPreviousText + " }}");
		var divPrevIcon = angular.element("<div><i class='icon arrow-left crop-circle white'></i></div>");
		var divPrevContent = angular.element("<div class='block-content'></div>");

		divPrevContent.append(divPrevIcon, divPrevText);
		divPrevious.append(divPrevBackdrop, divPrevContent);

		var divNext = angular.element("<div at-fixed class='next-block'></div>");
		divNext.attr("ng-click", attrs.atNext);
		var divNextBackdrop = angular.element("<div class='backdrop'></div>");
		var divNextText = angular.element("<div class='label'></div>");
		divNextText.text("{{ " + attrs.atNextText + " }}");
		var divNextIcon = angular.element("<div><i class='icon arrow-right crop-circle white'></i></div>");
		var divNextContent = angular.element("<div class='block-content'></div>");

		divNextContent.append(divNextIcon, divNextText);
		divNext.append(divNextBackdrop, divNextContent);

		element.append(divPrevious, divNext);

		$compile(element.contents())($scope);

		var positionBlocks = () => {
			var parent = element.parent();

			if (parent.length && element.is(":visible")) {
				$timeout(() => {
					var blockWidth = divNext.outerWidth();
					var windowWidth = $window.width();
					var position = parent.offset();
					var width = parent.outerWidth();

					var leftPos = position.left - blockWidth + 30;
					var rightPos = position.left + width - 30;

					if (leftPos < 0)
						leftPos = 0;

					if ((rightPos + blockWidth) > windowWidth)
						rightPos = windowWidth - blockWidth;

					divPrevious.css("left", leftPos + "px");
					divNext.css("left", rightPos + "px");
				});
			}
		};

		$timeout(positionBlocks, 250);

		// If either the window or content changes size, recenter blocks
		resizer.listenTo(element[0], positionBlocks);
		$window.resize(positionBlocks);

		divPrevious.hide();
		divNext.hide();

		var showBlocks = (event) => {
			// Chrome seems to trigger mouse move events when nothing is moving
			if ((Math.abs(lastX - event.clientX) < 3) && (Math.abs(lastY - event.clientY) < 3))
				return;

			lastX = event.clientX;
			lastY = event.clientY;

			if (showTimeout)
				$timeout.cancel(showTimeout);

			if (!divPrevious.is(":visible") && ($window.width() > 899)) {
				$timeout(() => {
					$animate.addClass(divPrevious, "animate-fade");
					$animate.addClass(divNext, "animate-fade");
				});
			}

			showTimeout = $timeout(() => {
				$timeout(() => {
					$animate.removeClass(divPrevious, "animate-fade");
					$animate.removeClass(divNext, "animate-fade");
				});
			}, showTime);

			if (!$dialog)
				$dialog = element.parents("[at-dialog]");
			if ($dialog.length) {
				$dialog.unbind("click", showBlocks);
				$dialog.click(showBlocks);
			}
			else
				$dialog = null;
		};

		$timeout(() => {
			$window.mousemove(showBlocks);
			$window.click(showBlocks);
		}, 250);

		// Tidy up our listeners if the element itself is destroyed
		element.on("$destroy", function() {
			resizer.removeListener(element[0], positionBlocks);
			$window.unbind("resize", positionBlocks);

			$window.unbind("mousemove", showBlocks);
			$window.unbind("click", showBlocks);

			if ($dialog)
				$dialog.unbind("click", showBlocks);
		});
	};

	return {
		restrict: "E",
		terminal: true,
		priority: 1100,
		link: link
	};
}]);
