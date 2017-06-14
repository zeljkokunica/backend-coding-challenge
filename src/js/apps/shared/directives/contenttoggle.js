/******************************************************************************************

Angular contenttoggle Directive

This directive toggles content taken from an array based on the model

Usage: <span at-contenttoggle="itemindex" at-options="[ 'Following', '<i>Not following</i>' ]"></span>
	this will fill the content of the span with the contents of the string at itemindex in the array

******************************************************************************************/

var app = angular.module("alchemytec.contenttoggle", [
]);

app.directive("atContenttoggle", ["$rootScope", function($rootScope) {
	var uniqueId = 1;

	var link = function($scope, element, attrs, ngModel) {
		var thisId = uniqueId++;

		var swapContent = function(newvalue) {
			
			var newContent = $scope.$eval(attrs.atOptions);
			
			element.html(newContent[newvalue]);
		};
		
		$scope.$watch(attrs.atContenttoggle, swapContent);
	};

	return {
		restrict: "A",
		link: link
	};
}]);
