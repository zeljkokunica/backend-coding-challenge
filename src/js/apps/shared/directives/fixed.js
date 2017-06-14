"use strict";

/******************************************************************************************

Angular fixed Directive

This directive pulls an element outside of it's container and attaches it to the end of the
body so it can be marked position fixed properly when it's parent may have a transform

Usage: <div at-fixed>Hi there!</div>

******************************************************************************************/

var app = angular.module("alchemytec.fixed", []);

app.directive("atFixed", ["$rootScope", "$compile", function($rootScope, $compile) {
	var $window = angular.element(window);
	var $body = angular.element("body");

	var link = function($scope, element, attrs) {
		var parent = element.parent();

		element.detach();
		$body.append(element);
		element.css("position", "fixed");

		element.attr("at-fixed", null);
		$compile(element)($scope);

		parent.on("$destroy", function() {
			element.remove();
		});
	};

	return {
		restrict: "A",
		terminal: true,
		scope: false,
		priority: 1000,
		link: link
	};
}]);
