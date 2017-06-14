"use strict";

/******************************************************************************************

Angular sequence Directive

This directive enables a series of UI steps that should be completed in sequence   

Usage: <at-sequence ng-model="currentStep">
				<at-step at-allow-forward="bankLetter">
					<h3>Bank letter</h3>
				</at-step>
				<at-step at-allow-backward="false">
					<h3>Contract approval</h3>
				</at-step>
			</at-sequence>

	this will display the first step and allow forward movement if bankLetter is true, but 
	does not allow backward movement from the second step

******************************************************************************************/

var app = angular.module("alchemytec.sequence", []);

app.directive("atSequence", ["$rootScope", "$timeout", "$compile", function($rootScope, $timeout, $compile) {
	var link = function($scope, element, attrs) {
		var stepElements = [];
		var steps = [];
		var dots = [];

		var clickSteps = $scope.$eval(attrs.atRandomAccess);
		
		var control = angular.element("<div class='step-control'></div>");
		var stepContainer = angular.element("<div class='step-container'></div>");
		var buttonForward = angular.element("<i class='icon next theme clickable'></i>");
		var buttonBackward = angular.element("<i class='icon previous theme clickable'></i>");

		if (!$scope[attrs.ngModel])
			$scope[attrs.ngModel] = 0;

		var getSteps = () => {
			stepElements = element.find("at-step");
			steps = [];
			dots = [];

			for (let u = 0; u < stepElements.length; u++) {
				var stepElement = angular.element(stepElements[u]);

				stepElement.forward = stepElement.attr("at-allow-forward") || "true";
				$scope.$watch(stepElement.forward, (newvalue, oldvalue) => {
					$timeout(enableDisableButtons);
				});
				
				stepElement.backward = stepElement.attr("at-allow-backward") || "true";
				$scope.$watch(stepElement.backward, (newvalue, oldvalue) => {
					$timeout(enableDisableButtons);
				});

				steps.push(stepElement);
				
				const newDot = angular.element("<i class='icon bullet'></i>");

				if (clickSteps) {
					const dotStep = u;

					newDot.addClass("clickable");
					newDot.click(function(event) {
						$scope[attrs.ngModel] = dotStep;
						showHideSteps();
						$scope.$apply();
					});
				}
				
				dots.push(newDot);
			}
		};

		var enableDisableButtons = () => {
			let u = $scope[attrs.ngModel];

			if (!u || !steps[u] || !$scope.$eval(steps[u].backward))
				buttonBackward.addClass("disabled");
			else
				buttonBackward.removeClass("disabled");

			if ((u == (steps.length - 1)) || !steps[u] || !$scope.$eval(steps[u].forward))
				buttonForward.addClass("disabled");
			else
				buttonForward.removeClass("disabled");
			
			for (let x = 0; x < steps.length; x++) {
				if (x == u)
					dots[x].addClass("selected theme");
				else
					dots[x].removeClass("selected theme");
			}
		};

		var showHideSteps = (skipAnimation) => {
			if (!steps.length)
				return;

			for (let u = 0; u < steps.length; u++) {
				if (u != $scope[attrs.ngModel])
					steps[u].hide();
				else
					steps[u].show();
			}

			enableDisableButtons();
		};

		var buildNavigation = () => {
			stepContainer.empty();
			stepContainer.append(dots);
		};
		
		control.append(buttonBackward, buttonForward, stepContainer);
		element.append(control);

		buttonForward.click((event) => {
			if (!buttonForward.hasClass("disabled") && ($scope[attrs.ngModel] < (steps.length - 1))) {
				$scope[attrs.ngModel]++;
				showHideSteps();
				$scope.$apply();
			}
		});

		buttonBackward.click((event) => {
			if (!buttonBackward.hasClass("disabled") && ($scope[attrs.ngModel] > 0)) {
				$scope[attrs.ngModel]--;
				showHideSteps();
				$scope.$apply();
			}
		});

		var showHeights = () => {
			var maxHeight = 0;

			for (let u = 0; u < steps.length; u++) {
				steps[u].show();
				maxHeight = Math.max(maxHeight, steps[u].outerHeight());
			}

			// This works but for sequences with a long step inside them,  documents it pushes the controls too far down
			/*for (let u = 0; u < steps.length; u++)
				steps[u].css("max-height", maxHeight + "px");*/

			showHideSteps();
		};

		var buildSteps = () => {
			getSteps();
			buildNavigation();
			showHideSteps();
			showHeights();
		};

		$timeout(() => {
			buildSteps();
		});

		if (attrs.atWatch) {
			$scope.$watch(attrs.atWatch, () => {
				$timeout(buildSteps);
			});
		}

		$scope.$watch(attrs.ngModel, showHideSteps);
	};

	return {
		restrict: "E",
		link: link
	};
}]);
