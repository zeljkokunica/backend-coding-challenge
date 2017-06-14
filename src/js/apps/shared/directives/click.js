/******************************************************************************************

Angular click Directive

This directive will trigger clicking another eelement when it is clicked

Usage: <a at-click="#clickme" at-on-click="showStuff = true">Click me</a><input id="clickme" ng-show="showStuff" at-dropdown="listOfThings" />
	this would show the input that was hidden by toggling its show value, and then click the input element to trigger the dropdown

Optional attribute at-on-click="doSomething()" will do something at least one full digest before the click
Relative elements can be targetted with $next, $prev, $parent

******************************************************************************************/

var app = angular.module("alchemytec.click", []);

app.directive("atClick", ["$timeout", "$animate", "$rootScope", function($timeout, $animate, $rootScope) {
	var link = function($scope, element, attrs) {
		var targetElement = [];
		var onClick = attrs.atOnClick;
		var clickers = attrs.atClick;

		var getTargets = function() {
			// If we have no special $ operators we can just get the target element
			if (clickers.search(/\$/) == -1)
				targetElement = angular.element(clickers);
			else {
				// Make special operators
				var evalToggle = "element." + clickers.replace(/\$([a-z]+)/ig, "$1()");
				evalToggle = evalToggle.replace(/\)([.#]+[a-z0-9]+)$/ig, "'$1')");

				targetElement = eval(evalToggle);
			}
		};
		
		var clickFunc = function(event) {
			// Make sure any clicks to element don't go anywhere else
			event.preventDefault();
			event.stopPropagation();

			// Get our list of targets at click time as they may not be there when we are instantiated
			getTargets();
			
			// Evaluate any onclick functions
			if (onClick)
				$scope.$eval(onClick);
			
			// Ensure this happens after at least one full digest to give onClick a chance to show things
			$scope.$evalAsync(function() {
				clickWhenVisible();
			});
		};
		
		var clickWhenVisible = function() {
			if (targetElement.is(":visible")) {
				targetElement.click();
				targetElement.focus();
			}
			else
				$timeout(clickWhenVisible, 0);
		};
		
		element.click(clickFunc);
	};

	return {
		restrict: "A",
		link: link
	};
}]);
