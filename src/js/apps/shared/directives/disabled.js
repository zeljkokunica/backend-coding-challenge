"use strict";
/******************************************************************************************

Angular disabled Directive


This directive monitors non-input elements and prevents click events when the disabled
attribute is set

Usage: <span ng-click="doSomething()" ng-disabled="isThisDisabled"> </span>
	the doSomething function will only be called when isThisDisabled is false

******************************************************************************************/

var app = angular.module("alchemytec.disabled", []);

app.directive("ngDisabled", [ function() {
	var link = function($scope, element, attrs, ngModel) {
		if (!_.includes([ "INPUT", "TEXTAREA", "BUTTON" ], element.prop("tagName"))) {
			element.click(function(event) {
				if (element.attr("disabled")) {
					event.stopImmediatePropagation();
					event.preventDefault();
				}
			});
		}
	};

	return {
		restrict: "A",
		priority: -1000,
		link: link
	};
}]);
