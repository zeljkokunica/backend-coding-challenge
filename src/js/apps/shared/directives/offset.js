/******************************************************************************************

Angular offset Directive


This directive adds a margin offset to an element

Usage: <div at-offset="index" at-step-size="58">Hi there!</div>
	this will create a block which has a top margin of index * 58

******************************************************************************************/

var app = angular.module("alchemytec.offset", []);

app.directive("atOffset", ["$rootScope", "$timeout", "$compile", "$animate", function($rootScope, $timeout, $compile, $animate) {
	var $window = angular.element(window);

	var link = function($scope, element, attrs) {
		var updateMargin = (newHeight) => {
			element.css({
				"margin-top": `${ newHeight }px`
			});
		};

		$scope.$watch(attrs.atOffset, (newvalue, oldvalue) => {
			var step = $scope.$eval(attrs.atStepSize) || 1;

			updateMargin(newvalue * step);
		});

		$scope.$watch(attrs.atStepSize, (newvalue, oldvalue) => {
			var offset = $scope.$eval(attrs.atOffset) || 0;

			updateMargin(offset * newvalue);
		});
	};

	return {
		restrict: "A",
		priority: 1,
		link: link
	};
}]);
