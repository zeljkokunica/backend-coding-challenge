/******************************************************************************************

Angular dropdown Directive


This directive adds a dropdown to an input field and sets the model for that input field to an object

Usage: <input at-dropdown="options" ng-model="name" at-autocomplete />
	this will use options for the list of label/id values to fill the dropdown, and set name to the object selected with options

******************************************************************************************/

var app = angular.module("alchemytec.dropdown", []);

app.directive("atDropdown", ["$rootScope", "$timeout", "$compile", "$animate", function($rootScope, $timeout, $compile, $animate) {
	var uniqueId = 1;
	var popupType = "dropdown";
	var $window = angular.element(window);
	var fadeSpeed = 250;
	var restDelay = 300;

	var link = function($scope, element, attrs, ngModel) {
		var thisId = uniqueId++;
		var debouncer = null;
		var addNew = attrs.atAddNew || false;
		var allowAutocomplete = (element.prop("tagName") == "INPUT");
		var allowFreetext = attrs.atFreetext || false;
		var allowDelete = attrs.atAllowDelete || (element.prop("tagName") == "INPUT" ? "true" : "false");
		var selectIfOne = attrs.atSelectIfOne || false;
		var onChange = attrs.atOnchange || false;
		var onCancel = attrs.atOncancel || false;
		var selectFirst = attrs.atSelectfirst || false;
		var selectAll = attrs.atSelectall || false;
		var preloadData = selectFirst || attrs.atPreloadData || false;
		var notNull = attrs.atNotNull || false;
		var simpleSearch = attrs.atSimpleSearch || false;
		var labelProperty = attrs.atLabelProperty || "label";
		var equalProperty = attrs.atEqualProperty || "id";
		var emptyString = attrs.atEmptyString || "";
		var hideCaret = attrs.atHideCaret || false;
		var hideIfEmpty = attrs.atHideIfEmpty || false;
		var showLimit = attrs.atShowLimit ? parseInt(attrs.atShowLimit, 10) : 10;
		var dropClass = attrs.atClass ? (" " + attrs.atClass) : "";
		var iconChevron = angular.element("<i class='icon dropdown postfix clickable'></i>");
		var dropList = angular.element("<ul class='droplist mousehover" + dropClass + "'></ul>");
		var noresultsLine = angular.element("<li class='noresults'>No results found</li>");
		var lineAddNew = angular.element("<li class='add clickable'>+ Add new</li>");
		var resultCount = 0, selectIndex = 0;
		var resultList = [];
		var lastModel = null;
		var isClosing = false, isOpening = null, isDirty = false, showWhenBuilt = false;
		var ignoreBlur = false, blurTimeout = null;

		// Add the uniqueId to the element and the dropdown so tests can match them up
		element.attr("at-unique-id", thisId);
		dropList.attr("at-unique-id", thisId);

		// Make the mouse icon click if required
		if (!allowAutocomplete)
			element.addClass("clickable");
		else
			element.attr("autocomplete", "off");

		element.addClass("dropdown");

		if (element.hasClass("larger")) {
			dropList.addClass("larger");
			iconChevron.addClass("larger");
		}
		else if (element.hasClass("smaller")) {
			dropList.addClass("smaller");
			iconChevron.addClass("smaller");
		}
		if (element.hasClass("bare"))
			iconChevron.addClass("bare");
		if (element.hasClass("bordered")) {
			dropList.addClass("inside");
			iconChevron.addClass("inside");
		}
		if (element.hasClass("figures"))
			dropList.addClass("figures");
		else if (element.hasClass("time"))
			dropList.addClass("time");

		// Make sure the added dropdown element respects ng-show on the main element
		if (attrs.ngShow) {
			iconChevron.attr("ng-show", attrs.ngShow);
			$compile(iconChevron)($scope);
		}

		// Cheap trick to make non-input elements receive keyboard events
		if (element.prop("tagName") != "INPUT")
			element.attr("tabindex", 0);
		iconChevron.attr("tabindex", 0);

		// Add custom elements
		if ((element.prop("tagName") != "I") && !hideCaret) {
			if (element.prop("tagName") == "LABEL")
				element.append(iconChevron);
			else
				element.after(iconChevron);
		}

		// Insert our DDL into the DOM and hide it
		angular.element("body").append(dropList);
		dropList.hide();

		// Return a string representation of a provided object
		var itemAsString = function(valueItem) {
			if (!valueItem)
				return emptyString;

			// Get a string representation of the item and strip any HTML
			valueItem = valueItem[labelProperty] || valueItem.name || (_.isString(valueItem) ? valueItem : "");
			valueItem = String(valueItem).replace(/<[^>]+?>/g, "").trim();

			return valueItem;
		};

		// Return a string representation with any content in brackets removed
		var itemAsCleanString = function(valueItem) {
			valueItem = itemAsString(valueItem);

			// Remove anything in brackets
			valueItem = valueItem.replace(/\([^\)]+?\)/g, "").trim();

			return valueItem;
		};

		// Update the view, call any onchange events
		var updateView = function(newvalue, autoSelected) {
			var compareValue = _.isObject(newvalue) ? (newvalue[equalProperty] || newvalue) : newvalue;
			var oldValue = _.isObject(lastModel) ? (lastModel[equalProperty] || lastModel) : lastModel;

			if (onChange && (compareValue != oldValue)) {
				var changeFunc = $scope.$eval(onChange);

				if (!changeFunc)
					console.log("Dropdown onChange function does not exist");
				else {
					$scope.$evalAsync(() => {
						changeFunc(newvalue, function(changed) {
							if (!_.isUndefined(changed)) {
								ngModel.$setViewValue(angular.copy(changed));
								ngModel.$render();
							}
						}, autoSelected);
					});
				}
			}
			else {
				$scope.$evalAsync(() => {
					ngModel.$setViewValue(angular.copy(newvalue));
					ngModel.$render();
				});
			}
		};

		// Show the droplist if it isn't already visible
		var showDropdown = function() {
			if (!dropList.is(":visible")) {
				var eleAnchor = attrs.atFor ? element.prev(attrs.atFor) : element;
				var offset = eleAnchor.offset();
				// Calculate the difference in padding for the dropdown and the field it matches to help alignment
				var paddingLeft = parseInt(eleAnchor.css("paddingLeft"), 10) - parseInt(dropList.find("li").first().css("paddingLeft"), 10);
				var dropBorder = parseInt(dropList.css("borderLeftWidth"), 10);

				offset.top += eleAnchor.outerHeight() - 1;
				offset.left += paddingLeft - dropBorder;

				dropList.show();
				dropList.offset(offset);

				dropList.css("minWidth", (eleAnchor.outerWidth() - (paddingLeft - dropBorder)) + "px");
				dropList.hide();

				$rootScope.$broadcast("opening-popup", { type: popupType, id: thisId, name: attrs.name });
				isOpening = $timeout(function() {
					$animate.addClass(dropList, "animate-fade").then(function() {
						isOpening = null;
					});
				}, 0);

				return true;
			}

			return false;
		};

		// Hide the droplist if it is visible
		var hideDropdown = function() {
			if (dropList && dropList.is(":visible") || isOpening) {
				if (isOpening) {
					$timeout.cancel(isOpening);
					isOpening = null;
				}

				isClosing = true;

				$scope.$evalAsync(() => {
					$animate.removeClass(dropList, "animate-fade").then(function() {
						$rootScope.$broadcast("closing-popup", { type: popupType, id: thisId, name: attrs.name });

						if (iconChevron) {
							// Reset delete icon to chevron
							iconChevron.removeClass("delete");
							iconChevron.addClass("dropdown");
						}

						isClosing = false;
					});
				});
			}
		};

		var buildList = function(newlist, filter) {
			// Sometimes this gets called after the element has been destroyed, so stop any errors
			if (!dropList)
				return;

			if (_.isArray(newlist))
				buildStaticList(newlist, filter);
			else if (_.isFunction(newlist)) {
				dropList.addClass("updating");
				if (debouncer)
					$timeout.cancel(debouncer);

				debouncer = $timeout(function() {
					// This prevents an edge case where a dropdown exists and an async callback triggers an update
					// but a popup broadcast has closed this dropdown in the meantime
					if (!dropList)
						return;

					newlist(filter, function(results) {
						// Edge case prevention
						if (!dropList)
							return;

						buildStaticList(results, filter);
						dropList.removeClass("updating");
					});
					debouncer = null;
				}, filter.length ? restDelay : 0);
			}
		};

		var getModelTestValue = function() {
			if (_.isObject(ngModel.$modelValue))
				return ngModel.$modelValue[equalProperty];
			else if (_.isObject(lastModel))
				return lastModel[equalProperty];
			else
				return ngModel.$modelValue;
		};

		var buildStaticList = function(newlist, filter) {
			resultCount = 0;
			resultList = [];

			dropList.find("li").not(".select").remove();
			lineAddNew.detach();

			if (simpleSearch)
				var matchList = [ filter ];
			else
				matchList = filter.replace(/,/g, " ").replace(/\s/g, " ").split(" ");

			var modelTestValue = getModelTestValue();

			angular.forEach(newlist, function(value, key) {
				if (resultCount == showLimit)
					return;

				var label = itemAsString(value);

				if (allowAutocomplete) {
					angular.forEach(matchList, function(keyword) {
						var index = label.toLowerCase().indexOf(keyword.toLowerCase());

						if (index == -1)
							return;

						label = label.substr(0, index) + "{{" + label.substr(index, keyword.length) + "}}" + label.substr(index + keyword.length);
					});

					label = label.replace(/\{\{/g, "<b>").replace(/\}\}/g, "</b>");
				}

				var listItem = angular.element("<li class='clickable'>" + label + "</li>");

				var compareValue = (value[equalProperty] === null) ? null : (value[equalProperty] || value);

				if (compareValue == modelTestValue) {
					listItem.addClass("current");
					listItem.append("<i class='icon small crop-circle checked'></i>");
				}

				listItem.click(function() {
					// If blur has been triggered, make sure it doesn't do anything
					if (blurTimeout) {
						$timeout.cancel(blurTimeout);
						blurTimeout = null;
					}

					updateView(value);
					hideDropdown();
				});

				dropList.append(listItem);
				resultCount++;
				resultList.push(value);
			});

			if (!resultCount)
				dropList.append(noresultsLine);

			if (addNew) {
				dropList.append(lineAddNew);

				lineAddNew.click((event) => {
					hideDropdown();
					$scope.$evalAsync(() => {
						$scope.$eval(addNew);
					});
				});
			}

			if (selectIfOne && !filter.length && (newlist.length == 1))
				updateView(newlist[0], true);

			if (selectFirst && !ngModel.$modelValue)
				updateView(newlist[0], true);

			if (!filter || !filter.length) {
				dropList.addClass("empty");
				if (hideIfEmpty)
					hideDropdown();
			}
			else {
				dropList.removeClass("empty");
				if (hideIfEmpty)
					showDropdown();
			}

			if (showWhenBuilt && !hideIfEmpty) {
				showWhenBuilt = false;
				showDropdown();
			}
		};

		$scope.$on("opening-popup", function(event, source) {
			if ((source.type != popupType) || (source.id != thisId))
				hideDropdown();
		});

		$scope.$on("quick-hide-popups", function(event, source) {
			if (dropList)
				dropList.hide();
		});

		var setOrUndoModel = function() {
			if (selectIndex) {
				updateView(resultList[selectIndex - 1]);
				ignoreBlur = true;
			}
			else if (allowFreetext) {
				updateView(ngModel.$modelValue);
				ignoreBlur = true;
			}
			else if (!notNull && !ngModel.$modelValue) {
				updateView(null);
				ignoreBlur = true;
				isClosing = true;
			}
		};

		// Process keyboard shortcuts
		var keyboardShortcuts = function(event) {
			switch (event.which) {
				case 27:	// Escape
					if (dropList.is(":visible")) {
						event.stopPropagation();
						event.preventDefault();

						hideDropdown();
						element.blur();
					}
					break;

				case 13:	// Enter
					event.stopPropagation();
					event.preventDefault();

					// Update the model
					setOrUndoModel();

					// Allow the element to treat an enter as a tab
					var tabEvent = jQuery.Event("keydown");
					tabEvent.which = 9;
					element.blur();
					element.trigger(tabEvent);

					hideDropdown();

					break;

				case 40:	// Cursor down
					event.stopPropagation();
					event.preventDefault();

					// Make sure we don't show mouse hovers
					dropList.removeClass("mousehover");
					dropList.find("li").removeClass("selected");

					if (!resultCount)
						return;

					selectIndex++;
					if (selectIndex > resultCount)
						selectIndex = resultCount;

					dropList.find("li:nth-child(" + selectIndex + ")").addClass("selected");

					break;

				case 38:	// Cursor up
					event.stopPropagation();
					event.preventDefault();

					// Make sure we don't show mouse hovers
					dropList.removeClass("mousehover");
					dropList.find("li").removeClass("selected");

					if (!resultCount)
						return;

					selectIndex--;
					if (selectIndex < 1)
						selectIndex = 1;

					dropList.find("li:nth-child(" + selectIndex + ")").addClass("selected");

					break;
			}
		};

		// Open autocomplete trigger events
		if (allowAutocomplete) {
			element.focus(function(event) {
				// Back up old model in case we need to cancel this selection
				lastModel = angular.copy(ngModel.$modelValue);
				isDirty = false;
				ignoreBlur = false;

				// Check if this is the default and temporarily clear it so the placeholder is visible
				if (!ngModel.$modelValue)
					element.val("");
				else {
					// Select everything
					element[0].selectionStart = 0;
					element[0].selectionEnd = element.val().length;

					if ($scope.$eval(allowDelete)) {
						// Allow delete
						iconChevron.removeClass("dropdown");
						iconChevron.addClass("delete");
					}
				}

				// Should show dropdown only after list is built
				showWhenBuilt = true;
				buildList($scope.$eval(attrs.atDropdown), ngModel.$modelValue ? itemAsString(ngModel.$modelValue) : "");
			});

			element.blur(function(event) {
				// In some instances like tabbing, we need to ignore blur
				if (ignoreBlur == true)
					return;

				// Changes to the model are done in the next event loop so
				// selecting a dropdown item which triggers blur before the click
				// event allows this to be cancelled
				blurTimeout = $timeout(function() {
					blurTimeout = null;

					// See if the model value is a selected object or not
					if (_.isString(ngModel.$modelValue)) {
						if (!ngModel.$modelValue.length) {
							if (notNull) {
								$scope.$eval(onCancel);
								ngModel.$setViewValue(angular.copy(lastModel));
								ngModel.$render();
							}
							else {
								updateView(null);
								element.val(emptyString);
							}
						}
						else if ((allowFreetext) && (ngModel.$modelValue != lastModel))
							updateView(ngModel.$modelValue);
						else {
							$scope.$eval(onCancel);
							ngModel.$setViewValue(angular.copy(lastModel));
							ngModel.$render();
						}
					}
					else if (!ngModel.$modelValue) {
						if (notNull) {
							$scope.$eval(onCancel);
							ngModel.$setViewValue(angular.copy(lastModel));
							ngModel.$render();
						}
						else
							element.val(emptyString);
					}
					hideDropdown();
				}, 0);
			});

			// Deal with tab out and escape
			element.keydown(function(event) {
				switch (event.which) {
					case 27:	// Escape
						if (dropList.is(":visible")) {
							event.stopPropagation();
							event.preventDefault();

							hideDropdown();
							element.blur();

							// Whenever we escape in an autocomplete we cancel our entry
							$scope.$eval(onCancel);
							ngModel.$setViewValue(angular.copy(lastModel));
							ngModel.$render();
						}
						break;

					case 9:	// Tab
						// Start hiding the dropdown so the view knows it should display inactive text
						hideDropdown();

						// Just in case enter triggers at-tab which triggers a tab event
						// we should ignore this whenever blur is also ignored
						if (!ignoreBlur)
							setOrUndoModel();

						break;
				}
			});

			// Update autocomplete list whenever a non-navigation key is pressed
			element.keyup(function(event) {
				switch (event.which) {
					case 9:		// Tab
					case 13:		// Enter
					case 16:		// Shift keys
					case 17:		// Ctrl keys
					case 27:		// Escape
					case 35:		// End
					case 36:		// Home
					case 37:		// Cursor left
					case 38:		// Cursor up
					case 39:		// Cursor right
					case 40:		// Cursor down
						break;

					default:
						// Filter the results based on the current text
						buildList($scope.$eval(attrs.atDropdown), element.val().trim());
						selectIndex = 0;
						isDirty = true;
				}
			});
		}
		else {
			element.click(function(event) {
				// Back up old model in case we need to cancel this selection
				lastModel = angular.copy(ngModel.$modelValue);

				// Should show dropdown only after list is built
				showWhenBuilt = true;
				buildList($scope.$eval(attrs.atDropdown), ngModel.$modelValue ? itemAsString(ngModel.$modelValue) : "");

				// Allow delete
				if ($scope.$eval(allowDelete) && ngModel.$modelValue) {
					iconChevron.removeClass("dropdown");
					iconChevron.addClass("delete");
				}
			});

			element.focus(function(event) {
				ignoreBlur = false;
			});

			// Deal with tab out
			element.keydown(function(event) {
				switch (event.which) {
					case 9:	// Tab
						// Start hiding the dropdown so the view knows it should display inactive text
						hideDropdown();

						// Just in case enter triggers at-tab which triggers a tab event
						// we should ignore this whenever blur is also ignored
						if (!ignoreBlur)
							setOrUndoModel();

						break;
				}
			});
		}

		// Make dropdown arrow trigger list
		iconChevron.click(function(event) {
			event.stopPropagation();
			if (iconChevron.hasClass("delete")) {
				if (notNull)
					updateView(angular.copy(lastModel));
				else
					updateView(null);

				// Non autocompletes don't lose focus so need to close it manually
				if (!allowAutocomplete)
					hideDropdown();
			}
			else if (allowAutocomplete)
				element.focus();
			else
				element.click();
		});

		// Allow keyboard navigation of dropdown
		element.on("keydown", keyboardShortcuts);
		iconChevron.on("keydown", keyboardShortcuts);

		dropList.mousemove(function() {
			dropList.addClass("mousehover");
			selectIndex = 0;
			dropList.find("li").removeClass("selected");
		});

		$window.click(hideDropdown);
		element.parents("[at-dialog]").first().click(hideDropdown);
		element.add(dropList).click(function(event) {
			event.stopPropagation();
		});

		// Tidy up our window listeners
		element.on("$destroy", function() {
			$window.unbind("click", hideDropdown);
			element.parents("[at-dialog]").first().unbind("click", hideDropdown);
			dropList.remove();
			dropList = null;
			iconChevron.remove();
			iconChevron = null;
		});

		ngModel.$viewChangeListeners.push(function() {
			if (!dropList.is(":visible") || isClosing) {
				var newValue = itemAsString(ngModel.$modelValue);

				if (newValue != element.val())
					element.val(newValue);
			}
		});

		if (selectIfOne || preloadData) {
			$scope.$watch(attrs.atDropdown, function(newvalue, oldvalue) {
				if (newvalue && (_.isArray(newvalue) || _.isFunction(newvalue)))
					buildList(newvalue, "");
			});
		}

		$scope.$on("dropdown-rebuild", function(event, id) {
			if (attrs.name == id)
				buildList($scope.$eval(attrs.atDropdown), "");
		});

		ngModel.$render = function() {
			if ((element.prop("tagName") == "INPUT") && !isOpening && dropList) {
				if (ngModel.$modelValue)
					element.val(itemAsString(ngModel.$modelValue));
				else if (dropList.is(":visible") && !isClosing)
					element.val("");
				else
					element.val(emptyString);

				// If the dropdown is visible, a deletable value exists and we aren't closing show the delete icon
				if ($scope.$eval(allowDelete)) {
					if (dropList.is(":visible") && ngModel.$modelValue && !isClosing) {
						iconChevron.removeClass("dropdown");
						iconChevron.addClass("delete");
					}
					else {
						iconChevron.removeClass("delete");
						iconChevron.addClass("dropdown");
					}
				}
			}
		};

		// Set the view value and render so if this has a value already it doesn't get converted to an [object Object] string
		ngModel.$setViewValue($scope.$eval(attrs.ngModel));
		ngModel.$render();
	};

	return {
		restrict: "A",
		require: "^ngModel",
		priority: 1,
		link: link
	};
}]);

app.service("dropdownService", [function() {

	return {
		findOption: function(options) {
			return function(text, callback) {
				text = text ? text.toLowerCase() : "";
				callback(_.filter(options, function(item) {
					var label = item.label || item;
					return label.toLowerCase().indexOf(text) >= 0;
				}));
			};
		}
	};

}]);
