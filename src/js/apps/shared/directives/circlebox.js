/******************************************************************************************

Angular circlebox Directive

This directive turns an element into a circle checkbox

Usage: <div><div at-circlebox ng-model="restactive" at-parent-touchable="true"> click me</div>
	this would show a circle checkbox in place of the div and clicking on the parent div will also toggle it

NB: When a parent element is touchable it also gains the class checked, in addition at-parent-touchable can
	be a number which specifies the number of parents up the tree to mark as touchable

******************************************************************************************/

var app = angular.module("alchemytec.circlebox", []);

app.directive("atCirclebox", function() {
	var getParentElement = function(element, level) {
		level = parseInt(level, 10) || 1;

		while (level) {
			element = element.parent();
			level--;
		}

		return element;
	};

	var link = function($scope, element, attrs, ngModel) {
		var touchParent = attrs.atParentTouchable ? getParentElement(element, attrs.atParentTouchable) : null;
		var onClick = attrs.atCircleClick || null;
		var onChange = attrs.atOnchange || false;
		var thirdState = attrs.atThirdstate || null;
		var reverseState = attrs.atReverseState || false;
		var truthy = attrs.atValue || "true";
		var radioButton = attrs.atRadio !== undefined || false;
		var disabled = false;
		var firstClick = true;

		var updateView = function(newvalue) {
			if (onChange) {
				var changeFunc = $scope.$eval(onChange);
				if (!changeFunc)
					console.log("Circlebox onChange function does not exist");
				else {
					changeFunc(newvalue, function(changed) {
						if (!_.isUndefined(changed)) {
							ngModel.$setViewValue(angular.copy(changed));
							updateClasses(changed);
						}
					});
				}
			}
			else {
				ngModel.$setViewValue(angular.copy(newvalue));
				updateClasses(newvalue);
			}
		};

		var updateClasses = function(newvalue) {
			if (thirdState)
				var thirdValue = $scope.$eval(thirdState);

			// Manage tristate classes
			if (thirdState) {
				if (newvalue === thirdValue) {
					element.addClass("third-state");
					if (touchParent)
						touchParent.addClass("third-state");
				}
				else {
					element.removeClass("third-state");
					if (touchParent)
						touchParent.removeClass("third-state");
				}
			}

			// Manage checked classes
			if ((newvalue == $scope.$eval(truthy)) || (thirdState && thirdValue && (newvalue === thirdValue))) {
				element.addClass("checked");
				if (touchParent)
					touchParent.addClass("checked");
			}
			else {
				element.removeClass("checked");
				if (touchParent)
					touchParent.removeClass("checked");
			}
		};

		var clickFunc = function(event) {
			event.preventDefault();
			event.stopPropagation();

			if (disabled)
				return;

			if (thirdState) {
				var initValue = $scope.$eval(thirdState);

				// See if we need to reverse the order we toggle things
				if (reverseState) {
					// When in the third state, checked and unchecked become unchecked
					if (element.hasClass("third-state"))
						updateView(false);
					// Checked state always becomes third state
					else if (element.hasClass("checked"))
						updateView(initValue);
					// Unchecked state always becomes third state unless this is the first click
					else
						updateView($scope.$eval(truthy));
				}
				// When in the third state, checked and unchecked become normal checked
				else if (element.hasClass("third-state"))
					updateView($scope.$eval(truthy));
				// Checked state always becomes unchecked as normal
				else if (element.hasClass("checked"))
					updateView(false);
				// Unchecked state always becomes third state unless this is the first click
				else if (firstClick)
					updateView($scope.$eval(truthy));
				else
					updateView(initValue);
			}
			// Bi-state checkboxes are simple
			else if (!radioButton && element.hasClass("checked"))
				updateView(false);
			else
				updateView($scope.$eval(truthy));

			firstClick = false;

			// Trigger any onclick event
			if (onClick)
				$scope.$eval(onClick);
		};

		element.click(clickFunc);
		if (touchParent) {
			touchParent.click(clickFunc);
			touchParent.addClass("clickable");
		}

		$scope.$watch(attrs.ngDisabled, function(newvalue, oldvalue) {
			if (newvalue) {
				disabled = true;
				element.addClass("disabled");
			}
			else {
				disabled = false;
				element.removeClass("disabled");
			}
		});

		// Adjust our circlebox when our model changes
		ngModel.$render = function() {
			updateClasses(ngModel.$viewValue);
		};
	};

	return {
		restrict: "A",
		require: "^ngModel",
		replace: true,
		template: "<div class='checkbox circle clickable'></div>",
		link: link
	};
});
