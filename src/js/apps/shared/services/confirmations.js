"use strict";

/******************************************************************************************

Angular confirmation Service

This service handles modal confirmation popups, which appear at the middle of the screen

******************************************************************************************/

var app = angular.module("alchemytec.confirmations", ["alchemytec.overlay"]);

app.factory("confirmations", [ "$rootScope", "$http", "$q", "$timeout", "$animate", "$templateCache", "$compile", "overlay", function($rootScope, $http, $q, $timeout, $animate, $templateCache, $compile, $overlay) {
	var uniqueId = 1;
	var confirmList = [];
	var $window = angular.element(window);
	var htHeading = angular.element("<div class='heading'></div>");
	var htText = angular.element("<div class='text'></div>");
	var htHeadText = angular.element("<div class='heading-text'></div>");
	var htIcon = angular.element("<div class='icon'></div>");
	var htConfirmationBox = angular.element("<div class='dialog-confirmation'><div class='backdrop'></div></div>");
	var buttonYes = angular.element("<button class='solid'></button>");
	var buttonNo = angular.element("<button class='bare'></button>");
	var htButtonBar = angular.element("<div class='button-bar'></div>");
	var htPartial = angular.element("<div class='content'></div>");
	var disabled = true;

	htHeadText.append(htHeading, htText);
	htButtonBar.append(buttonNo, buttonYes);
	htConfirmationBox.append(htIcon, htHeadText, htPartial, htButtonBar);
	angular.element("body").append(htConfirmationBox);
	htConfirmationBox.hide();

	var confirm = function(options) {
		var confirmation = {
			id: uniqueId++,
			icon: options.icon || "warning",
			heading: options.heading,
			text: options.text,
			partial: options.partial,
			data: options.data,
			parentScope: options.scope || false,
			class: options.class,
			yesText: options.yesText || "Okay",
			noText: options.noText || "Cancel",
			hideNoText: options.hideNoText || false,
			callbackYes: null,
			callbackNo: null
		};

		var promise = {
			then: (callbackYes) => {
				confirmation.callbackYes = callbackYes;
				return promise;
			},
			rejected: (callbackNo) => {
				confirmation.callbackNo = callbackNo;
				return promise;
			},
			cancel: () => {
				cancelConfirmation(confirmation.id);
				return promise;
			}
		};

		confirmList.push(confirmation);

		// If this is the only confirmation we should trigger a showing immediately
		if (confirmList.length == 1)
			showConfirmation();

		return promise;
	};

	// Shows the first confirmation in the list
	var showConfirmation = function() {
		if (confirmList.length) {
			// Set the content of the confirmation up
			htHeading.text(confirmList[0].heading);
			htText.text(confirmList[0].text);
			buttonYes.text(confirmList[0].yesText);
			buttonNo.text(confirmList[0].noText);
			if (confirmList[0].hideNoText)
				buttonNo.hide();
			else
				buttonNo.show();
			htIcon.removeClass().addClass("icon").addClass(confirmList[0].icon);

			htConfirmationBox.removeClass();
			htConfirmationBox.addClass("dialog-confirmation");
			if (confirmList[0].class)
				htConfirmationBox.addClass(confirmList[0].class);

			// Add partial
			htPartial.empty();
			if (confirmList[0].partial) {
				// Create a new scope for this partial
				if (confirmList[0].parentScope)
					confirmList[0].scope = confirmList[0].parentScope.$new();
				else
					confirmList[0].scope = $rootScope.$new(true);

				// Add any data required for this partial
				confirmList[0].scope.data = confirmList[0].data;

				// Add and compile the partial
				htPartial.append(angular.element($templateCache.get(confirmList[0].partial)));
				$compile(htPartial.contents())(confirmList[0].scope);
				htPartial.show();
			}
			else
				htPartial.hide();

			// Give the partial a chance to be filled with data
			$timeout(() => {
				// Center dialog
				htConfirmationBox.show();
				htConfirmationBox.offset({
					left: Math.floor(($window.outerWidth() - htConfirmationBox.outerWidth()) / 2),
					top: Math.floor(($window.outerHeight() - htConfirmationBox.outerHeight()) / 2) + $window.scrollTop()
				});

				// Kick off the animation
				$animate.addClass(htConfirmationBox, "animate-fade");
				$overlay.show("confirmation-overlay", null, "confirmation");
				disabled = false;
			});
		}
	};

	// Hides the first confirmation in the list
	var hideConfirmation = function() {
		if (htConfirmationBox.is(":visible")) {
			$timeout(function() {
				var promise = $animate.removeClass(htConfirmationBox, "animate-fade");
				$overlay.hide("confirmation-overlay");

				promise.then(function() {
					// If this has a scope make sure its destroyed
					if (confirmList[0].scope)
						confirmList[0].scope.$destroy();

					// Remove this notification
					confirmList.shift();

					// Show the next one if it exists
					$timeout(function() {
						showConfirmation();
					}, 0);
				});
			}, 0);
		}
	};

	// Cancels a confirmation
	var cancelConfirmation = function(id) {
		if (!confirmList.length)
			return;

		// See if the currently showed confirmation is this one
		if (confirmList[0].id == id)
			hideConfirmation();
		else {
			confirmList = _.filter(confirmList, function(value) {
				return value.id != id;
			});
		}
	};

	buttonYes.click(function(event) {
		if (!disabled) {
			disabled = true;
			hideConfirmation();

			if (confirmList[0].callbackYes)
				confirmList[0].callbackYes();
		}
	});

	buttonNo.click(function(event) {
		if (!disabled) {
			disabled = true;
			hideConfirmation();

			if (confirmList[0].callbackNo)
				confirmList[0].callbackNo();
		}
	});

	htConfirmationBox.click(function(event) {
		event.stopPropagation();
	});

	return {
		confirm: confirm
	};
}]);
