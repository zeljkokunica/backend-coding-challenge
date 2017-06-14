/******************************************************************************************

Angular popupmenu Directive

This directive adds a popup menu to an element

Usage: <i at-popupmenu ng-model="menuoptions" class="icon hamburger"></i>
	this will popup a menu configured by the array menuoptions
	menuoptions = [ { title: "somestring" || null, click: "scopefunctionname", enabled: true } ]

Note: the click function will be passed the menuoptions object that represents the clicked menu item

******************************************************************************************/

var app = angular.module("alchemytec.popupmenu", []);

// The popupmenu directive
app.directive("atPopupmenu", ["$rootScope", "$timeout", "$animate", "$compile", function($rootScope, $timeout, $animate, $compile) {
	var uniqueId = 1;
	var popupType = "popupmenu";
	var $window = angular.element(window);

	var link = function($scope, element, attrs, ngModel) {
		var thisId = uniqueId++;
		var menuElement = angular.element("<div class='menu-popup border-top-arrow right-arrow text-list'></div>");
		var menuList = angular.element("<ul></ul>");

		menuElement.append(menuList);
		angular.element("body").append(menuElement);

		var hideMenu = function() {
			element.removeClass("open");

			if (menuElement.hasClass("animate-fade")) {
				$timeout(function() {
					$animate.removeClass(menuElement, "animate-fade").then(function() {
						$rootScope.$broadcast("closing-popup", { type: popupType, id: thisId });
					});
				}, 0);
			}
		};

		$window.click(hideMenu);

		// Tidy up our window listeners
		element.on("$destroy", function() {
			$window.unbind("click", hideMenu);
			menuElement.remove();
		});

		element.addClass("clickable");

		element.click(function(event) {
			event.preventDefault();
			event.stopPropagation();

			// If the menu element exists, fade it out and stop here
			if (menuElement.is(":visible")) {
				hideMenu();
				return;
			}

			if (element.hasClass("disabled"))
				return;

			element.addClass("open");

			$rootScope.$broadcast("opening-popup", { type: popupType, id: thisId, name: attrs.name });

			// Position menu and fade in
			var elementPos = element.offset();

			elementPos.top += element.outerHeight() + 15;
			elementPos.left -= menuElement.outerWidth() - Math.floor(element.outerWidth() / 2) - 22;

			menuElement.css({ top: elementPos.top + "px", left: elementPos.left + "px" });
			$timeout(function() {
				$animate.addClass(menuElement, "animate-fade");
			});
		});

		$scope.$on("opening-popup", function(event, source) {
			if ((source.type != popupType) || (source.id != thisId))
				hideMenu();
		});

		// Rebuild our list whenever the model changes
		$scope.$watch(attrs.ngModel, function(newvalue, oldvalue) {
			menuList.empty();

			angular.forEach(newvalue, function(value, key) {
				var classes = [];

				if (value.disabled)
					classes.push("disabled");
				else if (value.title)
					classes.push("clickable");

				if (value.selected)
					classes.push("selected");

				if (value.class)
					classes.push(value.class);

				if (!value.title) {
					value.title = "";
					classes.push("seperator");
				}

				var attrClass = classes.length ? " class='" + classes.join(" ") + "'" : "";

				var newItem = angular.element("<li" + attrClass + ">" + value.title + "</li>");
				if (!value.disabled)
					newItem.data("click", value.click);

				if (!value.hidden)
					menuList.append(newItem);
				newItem.data("item", value);

				$compile(newItem.contents())($scope);
			});

			menuList.find("li").each(function() {
				var $this = angular.element(this);
				var item = $this.data("item");

				$this.unbind("click");
				$this.click(function(event) {
					event.stopPropagation();

					if ($this.data("click")) {
						var menuArgs = [ item ];

						if (attrs.atArguments) {
							var additionalArgs = $scope.$eval(attrs.atArguments);

							additionalArgs = _.isArray(additionalArgs) ? additionalArgs : [ additionalArgs ];
							menuArgs = menuArgs.concat(additionalArgs);
						}

						$timeout(function() {
							var clickHandler = $this.data("click") instanceof Function
								? $this.data("click")
								: $scope.$eval($this.data("click"));
							clickHandler.apply(this, menuArgs);
							hideMenu();
						}, 0);
					}
					else if (item.url)
						window.open(item.url, (item.newtab ? "_blank" : null)).focus();
				});
			});
			element.toggleClass("disabled", !newvalue || (newvalue.length == 0));
		});
	};

	return {
		restrict: "A",
		require: "^ngModel",
		link: link
	};
}]);
