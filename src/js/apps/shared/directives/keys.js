"use strict";

/******************************************************************************************

Angular key Directives

These directive allow elements to act when certain keys are pressed, to close a dialog
or submit a form, for example.

******************************************************************************************/

var app = angular.module("alchemytec.keys", []);

// Evaluate something if enter is pressed, usually used to submit a form
// eg: <input at-enter-submit="submitLogin()" />
app.directive("atEnterSubmit", [ "$timeout", function($timeout) {
	var link = function($scope, element, attrs) {
		element.bind("keydown keypress", function(event) {
			if (event.which === 13) {
				event.preventDefault();

				element.blur();

				$timeout(function() {
					$scope.$eval(attrs.atEnterSubmit);
				}, 0);
			}
		});
	};

	return {
		priority: 1001,
		link: link
	};
}]);

// Allow the escape key to trigger a function that may close a dialog
// eg: <div at-escape-key="closeDialog()"></div>
app.directive("atEscapeKey", ["$timeout", function($timeout) {
	var $window = angular.element(window);

	var link = function($scope, element, attrs) {
		var clickFunc = function(event) {
			if (event.which === 27) {
				event.preventDefault();

				$timeout(function() {
					$scope.$eval(attrs.atEscapeKey);
				}, 0);
			}
		};

		$window.bind("keydown keypress", clickFunc);

		element.on("$destroy", function() {
			$window.unbind("keydown keypress", clickFunc);
		});
	};

	return {
		priority: 1001,
		link: link
	};
}]);

// Allow the tab key to navigate around a form to the next or previous at-tab
// eg: <ng-form><input at-tab /> <textarea at-tab></textarea></ng-form>
app.directive("atTab", ["$rootScope", "$timeout", function($rootScope, $timeout) {
	var tabInProgress = false;

	var focusNext = function(element, backwards) {
		if (tabInProgress)
			return;
		else
			tabInProgress = true;

		var allTabs = element.parents("ng-form,[ng-form],.filter-form").find("[at-tab]:visible");
		var thisTab = 0;

		angular.forEach(allTabs, function(value, key) {
			if (value == element[0])
				thisTab = key;
		});

		if (backwards) {
			thisTab--;
			if (thisTab < 0)
				thisTab = allTabs.length - 1;
		}
		else {
			thisTab++;
			if (thisTab >= allTabs.length)
				thisTab = 0;
		}

		$timeout(function() {
			var focusElement = angular.element(allTabs[thisTab]);

			// For some non-input controls we must blur the current element otherwise it'll stay focused
			element.blur();

			// A and BUTTON tags just gain focus as we don't want to click them
			if (_.includes([ "A", "BUTTON" ], focusElement.prop("tagName")))
				focusElement.focus();
			// All fields receive focus except dropdown and dropdate fields that may need a click
			else if (focusElement.attr("at-dropdown") || focusElement.attr("at-dropdate") || (focusElement.prop("tagName") == "AT-FILE")) {
				if (focusElement.prop("tagName") == "INPUT") {
					focusElement.focus();
					focusElement.select();
				}
				else {
					focusElement.focus();
					focusElement.click();
				}
			}
			else {
				// Hide any dropdown elements before we focus
				$rootScope.$broadcast("opening-popup", { type: null, id: null });

				$rootScope.$evalAsync(() => {
					focusElement.focus();
					if (focusElement.prop("tagName") == "INPUT")
						focusElement.select();
					else
						focusElement.click();
				});
			}

			if (focusElement.is(":visible")) {
				var desiredTop = Math.floor($(window).outerHeight() / 3);
				var maximumTop = Math.floor($(window).outerHeight() / 3) * 2;
				var currentTop = focusElement.offset().top - $(window).scrollTop();

				if ((currentTop < 60) || (currentTop > maximumTop))
					angular.element("body, html").animate({ scrollTop: focusElement.offset().top - desiredTop }, 500);
			}

			tabInProgress = false;
		}, 100);
	};

	var link = function($scope, element, attrs) {
		var clickFunc = function(event) {
			if (event.which === 9) {
				event.preventDefault();

				focusNext(element, event.shiftKey);
			}
		};

		element.bind("keydown keypress", clickFunc);

		// Let's add a focus state to clickable elements
		if (_.includes([ "A", "BUTTON" ], element.prop("tagName"))) {
			element.focus(function() {
				element.addClass("focused");
			});
			element.blur(function() {
				element.removeClass("focused");
			});
		}
	};

	return {
		restrict: "A",
		scope: false,
		priority: 10,
		link: link
	};
}]);
