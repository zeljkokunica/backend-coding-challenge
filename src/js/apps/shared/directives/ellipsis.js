/******************************************************************************************

Angular ellipsis Directive


This directive abbreviates an element with ellipsis

Usage: <div><span at-ellipsis="model.property">Auntie Mavis teaches typing</span></div>
	this would abbreviate overflowed text to `Auntie Ma...es typing`

******************************************************************************************/

var app = angular.module("alchemytec.ellipsis", []);

app.directive("atEllipsis", ["$rootScope", "$timeout", function($rootScope, $timeout) {
	var $window = angular.element(window);
	var uniqueId = 1;

	var resizer = resizeDetector({
		strategy: "scroll"
	});

	var link = function($scope, element, attrs) {
		var thisId = uniqueId++;
		var $parent = element.parent();
		var lastText = "";

		// Add the class to prevent white space wrapping
		element.addClass("ellipsis-no-wrap");

		var beautifyText = function(text) {
			// Reset the text to un-ellipsed version
			element.html(text || "&nbsp;");
			element.attr("alt", text);

			if (!text)
				return;

			var initialText = text;

			// If this element isn't visible try next event loop
			if (!element.is(":visible")) {
				$timeout(function() {
					beautifyText(text);
				}, 100);
				return;
			}

			var parentWidth = $parent.width();
			var siblings = $parent.contents().not("object").not("[at-ellipsis],[at-ellipsis-ignore]");

			angular.forEach(siblings, function(value) {
				var $this = $(value);

				parentWidth -= $this.outerWidth();
				parentWidth -= parseInt($this.css("marginLeft"), 10);
				parentWidth -= parseInt($this.css("marginRight"), 10);
			});
			if (parentWidth < 20)
				parentWidth = 20;
			
			parentWidth -= siblings.length;

			// To ensure this works on block elements, we need to temporarily make them inline
			var oldDisplayCss = element.css("display");
			if (oldDisplayCss != "inline")
				element.css("display", "inline");

			var eleWidth = element.outerWidth();

			// Make sure we only iterate for strings long enough to do this for
			while ((text.length >= 7) && (eleWidth > parentWidth)) {
				var middle = Math.floor(text.length / 2);

				// Cut down iterations by cutting out larger sections when the text is bigger
				var cutLen = 1 + Math.floor((eleWidth - parentWidth) / 20);
				text = text.slice(0, middle - cutLen).trim() + "#" + text.slice(middle + 1 + cutLen).trim();
				element.html(text.replace(/#/, "&hellip;"));
				eleWidth = element.outerWidth();
			}

			if ((eleWidth > parentWidth) && (text.length < 7)) {
				// Start again with the first 10 letters
				text = initialText.substr(0, 7);
				element.html(text + "&hellip;");
				eleWidth = element.outerWidth();

				while ((text.length > 2) && (eleWidth > parentWidth)) {
					text = text.substr(0, text.length - 1);
					element.html(text + "&hellip;");
					eleWidth = element.outerWidth();
				}
			}

			// Restore old block style if not inline
			if (oldDisplayCss != "inline")
				element.css("display", oldDisplayCss);
		};

		var resizeFunc = function() {
			beautifyText(lastText);
		};

		resizer.listenTo($parent[0], resizeFunc);

		var disableWatch = $scope.$watch(attrs.atEllipsis, function(newvalue, oldvalue) {
			beautifyText(newvalue);
			lastText = newvalue;
		});

		element.on("$destroy", function() {
			disableWatch();
			resizer.removeListener($parent[0], resizeFunc);
		});
	};

	return {
		restrict: "A",
		link: link
	};
}]);
