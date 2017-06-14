/******************************************************************************************

Angular updown Directive


This directive adds an up/down button combination next to an input like control and
	also validates input

Usage: <input at-updown name="valuefield" ng-model="counter" class="quantity" at-min="-6" at-max="36" at-step="2" />
	this will create an input with updown control using min and max values, locking changes to the nearest step

******************************************************************************************/

var app = angular.module("alchemytec.updown", []);

app.directive("atUpdown", ["$rootScope", "$timeout", function($rootScope, $timeout) {
	var $window = angular.element(window);

	var link = function($scope, element, attrs, ngModel) {
		var min = attrs.atMin ? parseInt(attrs.atMin, 10) : null;
		var max = attrs.atMax ? parseInt(attrs.atMax, 10) : null;
		var step = parseInt(attrs.atStep, 10) || 1;

		var divUpDownArea = angular.element("<div class='at-updown'></div>");
		var buttonUp = angular.element("<div class='up clickable'></div>");
		var buttonDown = angular.element("<div class='down clickable'></div>");
		var divDivider = angular.element("<div class='divider'></div>");

		divUpDownArea.append(buttonUp, divDivider, buttonDown);
		element.after(divUpDownArea);

		var increaseValue = function() {
			var newValue = parseInt(ngModel.$modelValue, 10);
			if (_.isNaN(newValue))
				newValue = 0;
			newValue += step;

			if (max && (newValue > max))
				newValue = max;

			ngModel.$setViewValue(newValue);
			ngModel.$render();
		};

		var decreaseValue = function() {
			var newValue = parseInt(ngModel.$modelValue, 10);
			if (_.isNaN(newValue))
				newValue = 0;
			newValue -= step;

			if (min && (newValue < min))
				newValue = min;

			ngModel.$setViewValue(newValue);
			ngModel.$render();
		};

		buttonUp.click(function(event) {
			event.stopPropagation();

			increaseValue();
		});

		buttonDown.click(function(event) {
			event.stopPropagation();

			decreaseValue();
		});

		element.blur(function(event) {
			var newValue = parseInt(ngModel.$modelValue, 10);
			if (_.isNaN(newValue))
				newValue = 0;

			if (min && (newValue < min))
				newValue = min;
			if (max && (newValue > max))
				newValue = max;

			ngModel.$setViewValue(newValue);
			ngModel.$render();
		});

				// Process keyboard shortcuts
		element.on("keydown", function(event) {
			switch (event.which) {
				case 40:	// Cursor down
					event.stopPropagation();
					event.preventDefault();

					decreaseValue();

					break;

				case 38:	// Cursor up
					event.stopPropagation();
					event.preventDefault();

					increaseValue();

					break;
			}
		});
	};

	return {
		restrict: "A",
		require: "^ngModel",
		link: link
	};
}]);
