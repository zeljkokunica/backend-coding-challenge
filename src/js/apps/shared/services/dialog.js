"use strict";

/******************************************************************************************

Angular dialog Service

This service handles the creation and closing of dialogs

******************************************************************************************/

var app = angular.module("alchemytec.modaldialog", []);

app.service("dialog", ["$rootScope", "$q", "$timeout", "$compile", function($rootScope, $q, $timeout, $compile) {
	var $body = angular.element("body");
	var uniqueId = 1;
	var templates = {};
	var defaults = {
		disableCancel: true, // at-disable-close disables closing the dialog by clicking on the overlay
		showCloseIcon: true, // at-close-icon shows close icon in top right corner
		closeOnEscape: true, // at-escape-key triggers a dialog close
		dontAutoFocus: false, // at-dont-focus prevents the first element from receiving a click event
		waitForReady: false, // at-waitforready causes the dialog to remain hidden until a view-ready event
		overlayType: "grey" // at-overlay can be off, transparent, dark, grey or default
	};

	// Stores a dialog template in the list
	var addTemplate = function(name, partial, options) {
		if (templates[name])
			throw ("Added same dialog template twice");
		else {
			options = angular.extend(angular.copy(defaults), options);
			partial = "'" + partial + "'";
			templates[name] = { name: name, partial: partial, options: options };
		}
	};

	var addHtmlTemplate = function(name, html, options) {
		if (templates[name])
			throw ("Added same dialog template twice");
		else {
			options = angular.extend(angular.copy(defaults), options);
			templates[name] = { name: name, html: html, options: options };
		}
	};

	// Creates a dialog
	var createDialog = function(template, data, $scope) {
		// Create a scope for the dialog
		$scope = $scope || $rootScope;
		$scope = $scope.$new();

		// Setup the scope variables
		$scope.dialogShowDialog = false;
		$scope.dialogId = uniqueId++;
		$scope.dialogData = angular.copy(data);

		// Set up some scope methods for closing the dialog
		$scope.dialogCloseDialog = function(data) {
			$scope.$emit("close-dialog-" + $scope.dialogId, data);
		};

		// Load the template from the list if required
		if (_.isString(template)) {
			templates[template] || console.error("Unknown dialog template:", template);
			template = templates[template];
		}

		// Return a promise for this dialog
		return $q(function(resolve, reject) {
			// Create the directive for the dialog
			var atDialog = angular.element("<div></div>");

			if (template.options.dialogClass)
				atDialog.addClass(template.options.dialogClass);

			var attributes = {
				"id": "dialog-id-" + $scope.dialogId,
				"at-dialog": "dialogShowDialog",
				"at-include": template.partial,
				"at-disable-close": template.options.disableCancel,
				"at-close-icon": template.options.showCloseIcon,
				"at-escape-key": template.options.closeOnEscape ? "dialogCloseDialog()" : "",
				"at-dont-focus": template.options.dontAutoFocus,
				"at-overlay": template.options.overlayType,
				"at-close-event": "close-dialog-" + $scope.dialogId,
				"at-destroy-event": "destroy-dialog-" + $scope.dialogId,
				"at-waitforready": template.options.waitForReady
			};
			if (template.html) {
				var contents = angular.element(template.html);
				atDialog.append(contents);
			}

			angular.forEach(attributes, function(value, key) {
				if (value)
					atDialog.attr(key, value);
			});

			// Append to the DOM and trigger the directive
			$body.append(atDialog);
			$compile(atDialog)($scope);

			// Listen out for the close dialog event so we can resolve our promise
			$scope.$on("close-dialog-" + $scope.dialogId, function(event, data) {
				$scope.dialogShowDialog = false;

				// Decide if this was a success by a return value
				if (data)
					resolve(data);
				else
					reject();
			});

			// Listen out for the destroy dialog event so we can tidy up the DOM
			$scope.$on("destroy-dialog-" + $scope.dialogId, function(event) {
				atDialog.remove();
			});

			// Now we are set up, close the dialog
			$timeout(function() {
				$scope.dialogShowDialog = true;
			}, 0);
		});
	};

	return {
		template: addTemplate,
		htmlTemplate: addHtmlTemplate,
		open: createDialog
	};
}]);
