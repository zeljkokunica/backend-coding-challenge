/******************************************************************************************

Angular tabgroup Directive

This directive creates a set of tabs that are toggled on click in a group

Usage: <span at-tabgroup="group1" at-tabselected="goMoo()">Moo</span>
	this will create a comment box div where the text is bound to comment.comment and file list bound to comment.files

******************************************************************************************/

var app = angular.module("alchemytec.tabs", [
]);

app.directive("atTabgroup", ["$rootScope", "$timeout", function($rootScope, $timeout) {
	var uniqueId = 1;

	var link = function($scope, element, attrs, ngModel) {
		var thisId = uniqueId++;
		var tabGroup = attrs.atTabgroup || "main";
		var tabName = attrs.atTabname || ("tab-id-" + thisId);
		var tabSelected = attrs.atTabselected || null;
		var tabReSelected = attrs.atTabreselected || null;
		var tabUnselected = attrs.atTabunselected || null;
		var tabStopProp = attrs.atStopProp || false;
		
		if (attrs.atTabdefault)
			element.addClass("selected");
		
		element.addClass("clickable");
		
		var selectTab = function(skipevent) {
			// Don't allow multiple selections of the same tab
			if (!element.hasClass("selected")) {
				// Let other tabs know we've been selected
				$rootScope.$broadcast("tab-selected", tabGroup, thisId);
			
				element.addClass("selected");
				
				// Call the selected code if it exists
				if (!skipevent && tabSelected) {
					$timeout(function() {
						$scope.$eval(tabSelected);
					}, 0);
				}
			}
			else if (tabReSelected)
				$scope.$eval(tabReSelected);
		};

		element.click(function(event) {
			event.preventDefault();
			if (tabStopProp)
				event.stopPropagation();
			
			selectTab();
		});
		
		$scope.$on("tab-select", function(event, group, name) {
			if ((group == tabGroup) && (tabName == name))
				selectTab(true);
		});

		$scope.$on("tab-selected", function(event, group, id) {
			if ((group == tabGroup) && (thisId != id)) {
				// Another in our tab group has been clicked, so unclick us if we are selected
				if (element.hasClass("selected")) {
					element.removeClass("selected");
					
					// Call the unselected code if it exists
					if (tabUnselected)
						$scope.$eval(tabUnselected);
				}
			}
		});
	};

	return {
		restrict: "A",
		link: link
	};
}]);
