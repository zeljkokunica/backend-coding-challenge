"use strict";

/******************************************************************************************

Angular Directives for use in common apps

******************************************************************************************/

require("./directives/slidein.js");
require("./directives/clicktoggle.js");
require("./directives/popupmenu.js");
require("./directives/popupbox.js");
require("./directives/showmore.js");
require("./directives/dropdown.js");
require("./directives/resize.js");
require("./directives/tabs.js");
require("./directives/keys.js");
require("./directives/dialog.js");
require("./directives/contenttoggle.js");
require("./directives/spinnything.js");
require("./directives/circlebox.js");
require("./directives/sandpit.js");
require("./directives/slider.js");
require("./directives/updown.js");
require("./directives/fauxhover.js");
require("./directives/liveanchor.js");
require("./directives/ellipsis.js");
require("./directives/click.js");
require("./directives/disabled.js");
require("./directives/fixed.js");
require("./directives/dialogheader.js");
require("./directives/previousnext.js");
require("./directives/sequence.js");
require("./directives/offset.js");

var app = angular.module("alchemytec.directives", [
	"alchemytec.slidein",
	"alchemytec.clicktoggle",
	"alchemytec.popupmenu",
	"alchemytec.popupbox",
	"alchemytec.showmore",
	"alchemytec.dropdown",
	"alchemytec.resize",
	"alchemytec.tabs",
	"alchemytec.keys",
	"alchemytec.dialog",
	"alchemytec.contenttoggle",
	"alchemytec.spinnything",
	"alchemytec.circlebox",
	"alchemytec.sandpit",
	"alchemytec.slider",
	"alchemytec.updown",
	"alchemytec.fauxhover",
	"alchemytec.liveanchor",
	"alchemytec.ellipsis",
	"alchemytec.click",
	"alchemytec.disabled",
	"alchemytec.fixed",
	"alchemytec.dialogheader",
	"alchemytec.previousnext",
	"alchemytec.sequence",
	"alchemytec.offset"
]);

// The nozero validation directive marks a form field as invalid if it contains a zero value
// Usage: <input ng-required at-nozero ng-model="quantity" />
//	If quantity == "0" then this would be marked $invalid
app.directive("atNozero", function() {
	var link = function(scope, element, attrs, ngModel) {
		var validate = function(value) {
			var testvalue = value ? (value.value || value) : value;

			if (testvalue && !isNaN(parseInt(testvalue, 10)) && (parseInt(testvalue, 10) != 0))
				ngModel.$setValidity("nozero", true);
			else
				ngModel.$setValidity("nozero", false);

			return value;
		};

		ngModel.$parsers.unshift(function(value) {
			return validate(value);
		});

		ngModel.$formatters.unshift(function(value) {
			return validate(value);
		});
	};

	return {
		restrict: "A",
		require: "ngModel",
		link: link
	};
});


// The changed validation directive clears various validate states from a form field whenever the contents has changed
// Usage: <input ng-required at-changed="all" ng-model="username" />
//	Whenever username is changed, the input becomes valid
app.directive("atChanged", function() {
	var clearValidation = function(ngModel) {
		if (ngModel)
			ngModel.$setValidity("notfound", true);
	};

	var link = function($scope, element, attrs, ngModel) {
		$scope.$watch(attrs.ngModel, function(newValue, oldValue) {
			if (attrs.atChanged == "all") {
				var parentForm = element.parents("form,ng-form");
				var objForm = parentForm.scope()[parentForm.attr("name")];
				var fields = parentForm.find("[name]");

				angular.forEach(fields, function(value, key) {
					clearValidation(objForm[value.name]);
				});
			}
			else
				clearValidation(ngModel);
		});
	};

	return {
		restrict: "A",
		require: "ngModel",
		link: link
	};
});


// The currency directive formats a form field on blur to match the currency format
// Usage: <input at-currency at-currency-zero-invalid ng-model="price" />
//	If price == "23.4" then on blur the view will display 23.40
app.directive("atCurrency", function() {
	var link = function(scope, element, attrs, ngModel) {
		element.before("<i class='icon currency'></i>");
		element.addClass("quantity currency");

		var isZeroValid = !attrs.atCurrencyZeroInvalid;

		ngModel.$parsers.push(function(value) {
			value = parseFloat(value);

			ngModel.$setValidity("currency", isZeroValid ? !isNaN(value) : !!value);

			return value;
		});

		function format(value) {
			if (_.isUndefined(value))
				return value;

			value = parseFloat(value);

			ngModel.$setValidity("currency", isZeroValid ? !isNaN(value) : !!value);

			if (isNaN(value))
				return value;

			var pounds = Math.floor(value);
			var pence = String(Math.round((value - pounds) * 100));
			if (pence.length < 2)
				pence = "0" + pence;

			return pounds + "." + pence;
		}

		ngModel.$formatters.unshift(format);

		element.on("blur", function() {
			if (ngModel.$valid)
				element.val(format(ngModel.$modelValue));
		});
	};

	return {
		restrict: "A",
		require: "ngModel",
		link: link
	};
});


// The cleanser directive marks all elements of a form clean when the form is marked clean
// Usage: <form at-cleanser><input name="blah" /></form>
//	this will mark the blur element as pristine and !dirty whenever the form is marked clean
app.directive("atCleanser", function() {
	var link = function($scope, element, attrs, ngModel) {
		var formname = element.attrs("name");

		$scope.$watch(function() {
			return $scope[formname].$pristine;
		}, function() {
			if ($scope[formname].$pristine) {
				var formFields = element.find("input,textarea");

				angular.forEach(formFields, function(field) {
					var $field = angular.element(field);
					var name = $field.attrs("name");

					$scope[formname][name].$dirty = false;
					$scope[formname][name].$pristine = true;
				});
			}
		});
	};

	return {
		restrict: "A",
		link: link
	};
});


// The parentclass directive adds
// Usage: <div><div ng-if="showThis" at-parent-class="moo"></div></div>
//	If the inner div exists in the dom, the outer div will gain the class "moo"
app.directive("atParentClass", function() {
	return function($scope, element, attrs) {
		var parentElement = element.parents("div");

		// Add the class to the first div parent
		parentElement.addClass(attrs.atParentClass);

		// Remove the class when this element is destroyed
		element.on("$destroy", function() {
			parentElement.removeClass(attrs.atParentClass);
		});
	};
});


// The skippropagation directive allows a click event to bubble up the dom by skipping elements
// Usage: <div ng-click="doSomething()"><div at-skippropagation="window">But not when this is clicked</div></div>
//	If the inner div is clicked, the outer div won't receive the click event, but the window element will
app.directive("atSkippropagation", function() {
	return function($scope, element, attrs) {
		var parentElement = element.parents(attrs.atSkippropagation);

		element.click(function(event) {
			event.stopPropagation();

			parentElement.click();
		});
	};
});


// The at-mobile-click directive fires in place of an ng-click if the window is below a certain width
// Usage: <div ng-click="doSomething()" at-mobile-click="doSomethingElse()" at-mobile-width="500"></div>
//	If the window is wider than 500 pixels when the div is clicked, doSomething() is called, otherwise doSomethingElse() is called instead
app.directive("atMobileClick", [ "$timeout", function($timeout) {
	var $window = angular.element(window);

	var link = function($scope, element, attrs) {
		var mobWidth = attrs.atMobileWidth || 320;

		element.click(function(event) {
			if ($window.width() <= mobWidth) {
				event.stopImmediatePropagation();
				event.preventDefault();

				$timeout(function() {
					$scope.$eval(attrs.atMobileClick);
				}, 0);
			}
		});
	};

	return {
		restrict: "A",
		priority: -1,
		link: link
	};
}]);


// The at-mouseenter and at-mouseleave directives fire in place of ng-mouseenter and ng-mouseleave with a debounce
// Usage: <div at-mouseenter="doSomething()" at-mouseleave="doSomethingElse()" at-debounce="250"></div>
//	This will fire doSomething() immediately on moving the mouse over the div, but doSomethingElse() (and subsequent doSomething()s
//	will only fire after 250ms
app.directive("atMouseenter", [ "$timeout", function($timeout) {
	var link = function($scope, element, attrs) {
		var debounceTime = attrs.atDebounce || 500;
		var timer = null;

		element.mouseenter(function(event) {
			// Debounce enter
			if (timer) {
				$timeout.cancel(timer);
				timer = null;
				return;
			}

			$timeout(function() {
				$scope.$eval(attrs.atMouseenter);
			}, 0);
		});

		element.mouseleave(function(event) {
			if (timer)
				$timeout.cancel(timer);

			timer = $timeout(function() {
				timer = null;
				$scope.$eval(attrs.atMouseleave);
			}, debounceTime);
		});
	};

	return {
		restrict: "A",
		priority: -1,
		link: link
	};
}]);

// The at-matches directive marks an input element valid only if it matches another
// Usage: <input name="newemail" ng-required="true"><input name="confirmemail" ng-required="true" at-matches="newemail">
//	The confirmemail input will only aquire ng-valid status if it is equal to the newemail input field
app.directive("atMatches", ["$http", function($http) {
	return {
		require: "ngModel",
		link: function($scope, element, attrs, ngModel) {
			$scope.$watch(attrs.ngModel, function(newValue, oldValue) {
				if (!newValue || !newValue.length)
					ngModel.$setValidity("matches", false);
				else {
					var mainForm = element.parents("form,ng-form");
					var partnerElement = mainForm.find("input[name=" + attrs.atMatches + "]");

					ngModel.$setValidity("matches", partnerElement.length ? (newValue == partnerElement.val()) : false);
				}
			});
		}
	};
}]);

// The at-time-ago-past directive is a pass-thru directive to am-time-ago which ensures that the relavite date is always in the past
app.directive("atTimeAgoPast", ["$rootScope", function($rootScope) {
	return {
		restrict: "E",
		scope: true,
		link: function($scope, element, attrs) {
			$scope.$watch(attrs.atTime, function(newValue, oldValue) {
				$scope.timestamp = newValue;

				if (newValue > new Date())
					$scope.timestamp = new Date(Date.now() - 10000);
			});

			if (attrs.atToggleDisplay !== undefined) {
				$rootScope.$watch("atTimePastDisplayState", function(value) {
					// toggle absolute time display
					$(element).find(".relative").toggle(value != true);
					$(element).find(".absolute").toggle(value == true);
				});
				$(element).click(function() {
					$rootScope.atTimePastDisplayState = !$rootScope.atTimePastDisplayState;
					$rootScope.$digest();
				});
			}

			if (attrs.atAbsoluteFormat)
				$scope.dateFormat = attrs.atAbsoluteFormat;
			else
				$scope.dateFormat = "DD MMM YYYY, HH:mm";

			$(element).find(".absolute").hide();
		},
		template: "<span class='relative clickable' am-time-ago='timestamp'></span><span class='absolute clickable'>{{ timestamp | amDateFormat:dateFormat }}</span>"
	};
}]);

// The at-helper-list-columns directive is for aiding layout by providing various body-rows with alignment markers
app.directive("atHelperListColumns", [function() {
	return {
		restrict: "E",
		link: function($scope, element, attrs) {
			var columns = 25;
			var classPrefix = "col-1";
			var highlightStep = 1;
			var bodyRow = $("<div class='body-row'></div>");

			switch (attrs.atGridSize) {
				case "50":
					columns = 50;
					classPrefix = "half-col-1";
					highlightStep = 2;
					break;

				case "25":
				default:
			}

			for (var u = 0; u < columns; u++) {
				var className = classPrefix + " test-borders" + (((u + 1) % highlightStep) ? " stronger" : "");
				bodyRow.append("<div class='" + className + "'>o</div>");
			}

			element.replaceWith(bodyRow);
		}
	};
}]);
