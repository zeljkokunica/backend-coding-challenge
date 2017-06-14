"use strict";

/******************************************************************************************

Angular dialog header Directive

This directive turns an element into a slide in heading for a dialog box

Usage: <at-dialog-header>Go west?<at-dialog-header>
	this will slide down the header whenever the position the element is declared in
	reaches the top of the browser window

******************************************************************************************/

var app = angular.module("alchemytec.dialogheader", []);

app.directive("atDialogHeader", ["$rootScope", "$compile", "$timeout", function($rootScope, $compile, $timeout) {
	var $window = angular.element(window);
	var $body = angular.element("body");

	var resizer = resizeDetector({
		strategy: "scroll"
	});

	var link = function($scope, element, attrs) {
		var divHeader = angular.element("<div at-fixed at-slidein class='dialog-header' at-min-scroll='getDialogHeaderTop()' at-slide-speed='250'></div>");
		var divBackdrop = angular.element("<div class='backdrop'></div>");
		var divBar = angular.element("<div class='rule-wrapper'><div class='bottom-rule'></div><div class='bottom-gradient'></div></div>");
		var divContents = angular.element("<div class='header-content'></div>");

		divContents.append(element.contents());
		divHeader.append(divBackdrop, divContents, divBar);

		element.append(divHeader);

		// Stop clicks inside this dialog propagating
		divHeader.click(function(event) {
			event.stopPropagation();
		});

		$scope.getDialogHeaderTop = () => {
			return element.offset().top;
		};

		$compile(divHeader)($scope);

		var resizeHeader = () => {
			var parentDialog = element.parents("[at-dialog]");

			if (parentDialog.length) {
				$timeout(() => {
					var position = divHeader.offset();

					divHeader.width(parentDialog.outerWidth());
					position.left = parentDialog.offset().left;
					divHeader.offset(position);
				});
			}
		};

		$timeout(resizeHeader, 250);

		// If either the window or content changes size, recenter dialog
		resizer.listenTo(element[0], resizeHeader);
		$window.resize(resizeHeader);

		// Tidy up our listeners if the element itself is destroyed
		element.on("$destroy", function() {
			resizer.removeListener(element[0], resizeHeader);
			$window.unbind("resize", resizeHeader);
		});
	};

	return {
		restrict: "E",
		terminal: true,
		priority: 1100,
		link: link
	};
}]);
