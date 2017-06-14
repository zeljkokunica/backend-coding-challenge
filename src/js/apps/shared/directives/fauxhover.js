/******************************************************************************************

Angular fauxhover Directive


This directive adds a sticky hover abilities to elements by way of the hover class

Usage: <div at-fauxhover="hovering" ng-click="hovering = true"></div>
	this will add the hover class to the div whenever it is clicked, removing the class
	and setting hovering to false when any popup close event is triggered

******************************************************************************************/

var app = angular.module("alchemytec.fauxhover", []);

app.directive("atFauxhover", ["$rootScope", "$timeout", function($rootScope, $timeout) {
	var $window = angular.element(window);

	var link = function($scope, element, attrs) {
		var popup = false;

		$scope[attrs.atFauxhover] = false;
		$scope.$watch(attrs.atFauxhover, function(newvalue, oldvalue) {
			if (newvalue)
				element.addClass("hover");
			else
				element.removeClass("hover");
		});
		
		$scope.$on("opening-popup", function(event, source) {
			// First popup out of the ranks we assume was triggered by a hover state element
			if (!popup && $scope.$eval(attrs.atFauxhover))
				popup = angular.copy(source);
		});
		
		$scope.$on("closing-popup", function(event, source) {
			// Only popup closing we listen to is the one first opened
			if (popup && (popup.type == source.type) && (popup.id == source.id)) {
				popup = null;
				$timeout(function() {
					$scope[attrs.atFauxhover] = false;
				}, 0);
			}
		});
	};

	return {
		restrict: "A",
		link: link
	};
}]);
