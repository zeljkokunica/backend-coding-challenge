/******************************************************************************************

Angular directives for resizing controls

******************************************************************************************/

var app = angular.module("alchemytec.resize", []);

// The at-auto-resize watches models for changes and resizes content to fit, usually used where for a textarea
// Usage: <textarea name="textarea" ng-model="comment" ng-trim="false"></textarea>
//	this will watch $scope.comment then resize the textarea to fit the content
// NB: textareas should have ngTrim set to false
// the minimum height is deduced from the initial height of the element (CSS)
// the maximum height can be set using the max-height CSS property
app.directive("atAutoResize", ["$timeout", function($timeout) {
	var link = function($scope, element, attrs, ngModel) {
		if (!ngModel)
			return console.log("Nothing for auto-resize to watch :(");

		var minAreaHeight = 10;
		var timerVisible = null, timerFrequency = null;

		// Prevent scrollbars appearing
		element.css("overflow", "hidden");

		var resizeElements = function(newvalue, oldvalue) {
			// Cancel any existing waiting for visibility timeouts
			if (timerVisible) {
				$timeout.cancel(timerVisible);
				timerVisible = null;
			}

			// We'll be calling this soon so don't update yet
			if (timerFrequency)
				return;

			// If this element isn't visible, check until it is
			if (!element.is(":visible")) {
				timerVisible = $timeout(function() {
					resizeElements(newvalue, oldvalue);
				}, 100);

				return;
			}

			var resizeContainer = function() {

				// If any element we rely on the size of is invisible, we need to try again later when it may be visible
				if (invisible) {
					timerVisible = $timeout(function() {
						resizeElements(newvalue, oldvalue);
					}, 100);
				}
				else {
					var newHeight = 0;
					var invisible = false;
					var currentHeight = element.height();
					if (element.prop("tagName") == "TEXTAREA") {
						// reset the height in order to get the scrollHeight when the height is shrinking
						element.height(minAreaHeight);
						// calculate the new height
						newHeight = element.height() + element.prop("scrollHeight") - element.innerHeight();
						// restore the currentHeight to get the animation to work when the height is shrinking
						element.height(currentHeight);
					}
					else
						newHeight = element.outerHeight();

					element.stop();
					if (newHeight < currentHeight)
						element.animate({ height: newHeight });
					else
						element.css("height", newHeight + "px");
				}
			};

			// If this isn't a string assume it's a zero length one
			if (!_.isString(newvalue))
				newvalue = "";

			if (!_.isString(oldvalue) || (newvalue.length < oldvalue.length)) {
				$timeout(function() {
					resizeContainer();
				}, 0);
			}
			else {
				// Make sure we don't call this too often and slow down typing
				timerFrequency = $timeout(function() {
					timerFrequency = null;
					resizeContainer();
				}, 100);
			}
		};

		$scope.$watch(attrs.ngModel, resizeElements);

		minAreaHeight = element.height();

		element.on("$destroy", function() {
			if (timerVisible)
				$timeout.cancel(timerVisible);
			if (timerFrequency)
				$timeout.cancel(timerFrequency);
		});
	};

	return {
		restrict: "A",
		require: "ngModel",
		link: link
	};
}]);
