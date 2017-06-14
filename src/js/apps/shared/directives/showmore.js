/******************************************************************************************

Angular showmore and showmoreless Directives


The showmore directive places a clickable ruler at the bottom of an element that can be used to load and view more content

Usage: <div at-showmore="loadMoreContent" show-count="remainingCount()">
	this would call $scope.loadMoreContent = function(callback) {}; when clicked and then reveal the additional content


The showmoreless directive is very similar, but does not load content, it only shows or hides overflow-y content

Usage: <div at-showmoreless="watchvars" at-showmore-info="infohtmlvar">
	this will show hidden content when the clickable ruler is visible, or hide it if already visible, watch watchvars for changes,
	and include the contents of infohtmlvar as html next to showmore

******************************************************************************************/

var app = angular.module("alchemytec.showmore", [ "alchemytec.spinnything" ]);

app.directive("atShowmore", ["$timeout", "$compile", function($timeout, $compile) {
	var link = function($scope, element, attrs) {
		var moreCount = angular.element("<span></span>");
		var wrapHtml = angular.element("<div class='show-more-wrapper'><div class='show-more-gradient'></div><div class='show-more-rule'></div></div>");
		var showHtml = angular.element("<div class='show-more clickable'></div>");
		var showTextHtml = angular.element("<span></span>");
		var lastMoreCount = 0;

		// We make this a scope property so the spinny thing can react to it
		$scope.isLoading = false;

		showTextHtml.append("Show ", moreCount, " more");
		showHtml.append("<at-spinny-thing at-size='small' at-animate='isLoading'>", showTextHtml);
		wrapHtml.append(showHtml);
		wrapHtml.css("marginTop", "-" + (parseInt(element.css("marginBottom"), 10) - 10) + "px");
		element.after(wrapHtml);

		$compile(wrapHtml.contents())($scope);

		showHtml.click(function() {
			// Make sure we aren't loading more already
			if ($scope.isLoading)
				return;
			$scope.isLoading = true;

			// Make the element height fixed so when new content is added it is hidden
			element.css("overflow-y", "hidden");
			element.height(element.height());

			// Update the clickable text so the user knows something is happening
			showTextHtml.html("Retrieving more");
			var method = $scope.$eval(attrs.atShowmore);
			method(function() {
				// Put the animation in the next digest so the DOM has had a chance to be updated with the new elements
				$timeout(function() {
					element.animate({ height: element.prop("scrollHeight") }, lastMoreCount * 50, function() {
						// Return the table back to auto height
						element.css("overflow-y", "visible");
						element.css("height", "");

						// Update the clickable text to allow for more results
						showTextHtml.empty();
						showTextHtml.append("Show ", moreCount, " more");

						$timeout(function() {
							$scope.isLoading = false;
						}, 0);
					});
				}, 0);
			});
		});

		$scope.$parent.$watch(attrs.atShowCount, function(newvalue, oldvalue) {
			lastMoreCount = newvalue;

			// Number of results has changed so either update text or hide offer to show more
			if (newvalue) {
				moreCount.text(newvalue);
				wrapHtml.show();
			}
			else
				wrapHtml.hide();
		});
	};

	return {
		restrict: "A",
		scope: true,
		link: link
	};
}]);


app.directive("atShowmoreless", ["$timeout", function($timeout) {
	var showSpeed = 300;

	var link = function($scope, element, attrs) {
		var $window = angular.element(window);
		var wrapHtml = angular.element("<div class='show-more-wrapper'><div class='show-more-gradient'></div><div class='show-more-rule'></div></div>");
		var showHtml = angular.element("<div class='show-more clickable'></div>");
		var showTextHtml = angular.element("<span></span>");
		var extraHtml = angular.element("<div class='show-more-extra'></div>");

		// Get the maximum height for the element when not fully visible
		var maxHeight = parseInt(element.css("maxHeight"), 10);

		showTextHtml.append("Show more");
		showHtml.append(extraHtml, "<i class='icon more crop-circle'></i>", showTextHtml);
		wrapHtml.append(showHtml);
		wrapHtml.css("marginTop", "-" + (parseInt(element.css("marginBottom"), 10) - 10) + "px");
		element.after(wrapHtml);

		var showHide = function() {
			// If there is no height come back later
			if (element.height() == 0) {
				setTimeout(showHide, 200);
				return;
			}

			// For some reason IE can have a fractional height here, so we need to add in a pixel to prevent a pointless toggle
			if (element.prop("scrollHeight") > (element.height() + 1))
				wrapHtml.show();
			else
				wrapHtml.hide();
		};

		$window.resize(showHide);

		// Tidy up our window listeners
		element.on("$destroy", function() {
			$window.unbind("resize", showHide);
		});

		showHtml.click(function() {
			if (element.prop("scrollHeight") > element.height()) {
				// Set the height to the max-height and then clear the css
				element.css("height", maxHeight + "px");
				element.css("maxHeight", "none");

				element.animate({ height: element.prop("scrollHeight") + 10 }, showSpeed, function() {
					// Update the clickable text
					showTextHtml.html("Show less");
				});
			}
			else {
				element.animate({ height: maxHeight }, showSpeed, function() {
					// Update the clickable text
					showTextHtml.html("Show more");

					// Reset the CSS
					element.css("height", "auto");
					element.css("maxHeight", maxHeight + "px");
				});
			}
		});

		angular.forEach(attrs.atShowmoreless.split(","), function(value, key) {
			$scope.$watch(value, function(newvalue, oldvalue) {
				// Make sure DOM is updated before we show/hide
				$timeout(showHide, 0);
			});
		});

		if (attrs.atShowmoreInfo) {
			$scope.$watch(attrs.atShowmoreInfo, function(newvalue, oldvalue) {
				// Make sure DOM is updated before we show/hide
				extraHtml.html(newvalue);
			});
		}
	};

	return {
		restrict: "A",
		link: link
	};
}]);
