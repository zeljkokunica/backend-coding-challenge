/******************************************************************************************

Angular liveanchor Directive


The liveanchor directive scrolls an area to anchors and updates the model when the area is scrolled

Usage: <div at-liveanchor="anchorVar"><h3 name="first"></h3><h3 name="second"></h3></div>
	this will scroll the div to the element with a matching name parameter whenever
	the anchorVar variable is changed, and update the variable to the var closest to the top of the visible area.

******************************************************************************************/

var app = angular.module("alchemytec.liveanchor", []);

app.directive("atLiveanchor", ["$timeout", function($timeout) {
	var scrollSpeed = 300;
	var updateRate = 250;
	var threshold = 30;
	var offset = 15;
	
	var link = function($scope, element, attrs, ngModel) {
		var timerUpdate = null;
		var ignoreWatch = false;
		
		var updateAnchor = function() {
			var anchorList = element.find("[name]");
			var topAnchor = null;

			// On scroll find first anchor near the top
			angular.forEach(anchorList, function(value) {
				var $this = angular.element(value);

				if ($this.position().top < threshold)
					topAnchor = $this;
			});
			
			if (topAnchor) {
				ignoreWatch = true;
				ngModel.$setViewValue(topAnchor.attr("name"));
				ignoreWatch = false;
			}
		};
		
		element.scroll(function(event) {
			// Debounce scroll checks
			if (timerUpdate)
				$timeout.cancel(timerUpdate);
			
			timerUpdate = $timeout(updateAnchor, updateRate);
		});
	
		$scope.$watch(attrs.ngModel, function(newvalue, oldvalue) {
			if (!ignoreWatch && newvalue) {
				// Find named anchor
				var targetAnchor = element.find("[name='" + newvalue + "']");

				// Scroll smoothly to new anchor
				if (targetAnchor.length)
					element.animate({ scrollTop: element.scrollTop() + targetAnchor.position().top - offset }, scrollSpeed);
			}
		});
	};

	return {
		restrict: "A",
		require: "ngModel",
		link: link
	};
}]);
