/******************************************************************************************

Angular slider Directive


This directive creates a horizontal slider with two handles for range selection

Usage: <at-slider ng-model="time" at-min="0" at-max="1440" at-step="15" at-translate="toTimeString" />
	this will create a slider with min and max values, locking changes to the nearest step

******************************************************************************************/

var app = angular.module("alchemytec.slider", []);

app.directive("atSlider", ["$rootScope", "$timeout", function($rootScope, $timeout) {
	var $window = angular.element(window);

	var link = function($scope, element, attrs, ngModel) {
		var min = attrs.atMin || 0;
		var max = attrs.atMax || 100;
		var step = attrs.atStep || 10;
		var range = attrs.atRange || false;

		var background = angular.element("<div class='background'></div>");
		var bar = angular.element("<div class='bar'></div>");
		var tickmarks = angular.element("<div class='tickmarks'></div>");
		var tickmarks_range = angular.element("<div class='tickmarks range'></div>");
		var majortickmarks = angular.element("<div class='tickmarks major'></div>");
		var majortickmarks_range = angular.element("<div class='tickmarks major range'></div>");
		var dragging = null;
		var dragstart = null;
		var focused = "start";

		element.attr("tabindex", 0);

		var handles = {
			start: {
				element: angular.element("<div class='handle start'></div>"),
				value: ngModel.$modelValue.start || $scope.$eval(min)
			}
		};

		if (range) {
			handles.finish = {
				element: angular.element("<div class='handle end'></div>"),
				value: ngModel.$modelValue.finish || $scope.$eval(max)
			};
		} else {
			element.addClass("single");
		}

		var bar_handle = {
			element: bar
		};

		element.append(majortickmarks, tickmarks, background);
		if (range) {
			background.append(bar);
			element.append(tickmarks_range);
			element.append(majortickmarks_range);
		}

		var getExtents = function(handle) {
			var offset = bar.offset();

			handle.width = handle.element.outerWidth();
			handle.offset = Math.floor(handle.width / 2);
			handle.extents = {
				left: 0,
				right: background.width() - handle.width
			};
			handle.startpos = handle.element.position().left;
			handle.min = $scope.$eval(min);
			handle.max = $scope.$eval(max);
			handle.step = $scope.$eval(step);
			handle.valperpixel = (handle.max - handle.min) / (handle.extents.right - handle.extents.left);
		};

		var isInverted = function() {
			return handles.start.value > handles.finish.value;
		};

		var updateBar = function(dragging) {
			dragging = dragging || handles.start;

			if (handles.finish) {
				var start = parseInt(handles.start.element.css("left"), 10);
				var finish = parseInt(handles.finish.element.css("left"), 10);
				var height = tickmarks_range.outerHeight();
				var finish_offset = handles.finish.step / handles.finish.valperpixel;
				if (isInverted()) {
					bar.css("left", (finish + handles.finish.offset + 1) + "px");
					bar.css("right", (dragging.extents.right - start + handles.start.offset) + "px");
					var clip_right = start - 1;
					var clip_left = finish + finish_offset;
					tickmarks_range.css("clip",
							"rect(0px,"
							+ clip_right + "px,"
							+ height + "px,"
							+ clip_left + "px)");
					majortickmarks_range.css("clip",
							"rect(0px,"
							+ clip_right + "px,"
							+ height + "px,"
							+ clip_left + "px)");
					background.addClass("inverted");
					tickmarks.addClass("inverted");
					tickmarks_range.addClass("inverted");
					majortickmarks.addClass("inverted");
					majortickmarks_range.addClass("inverted");
				}
				else {
					bar.css("left", (start + handles.start.offset) + "px");
					bar.css("right", (dragging.extents.right - finish + handles.finish.offset - 1) + "px");
					var clip_right = finish + finish_offset;
					var clip_left = start;
					tickmarks_range.css("clip",
							"rect(0px,"
							+ clip_right + "px,"
							+ height + "px,"
							+ clip_left + "px)");
					majortickmarks_range.css("clip",
							"rect(0px,"
							+ clip_right + "px,"
							+ height + "px,"
							+ clip_left + "px)");
					background.removeClass("inverted");
					tickmarks.removeClass("inverted");
					tickmarks_range.removeClass("inverted");
					majortickmarks.removeClass("inverted");
					majortickmarks_range.removeClass("inverted");
				}
			}
		};

		var clampPos = function(pos, extents) {
			if (pos < extents.left)
				pos = extents.left;
			if (pos > extents.right)
				pos = extents.right;
			return pos;
		};

		var updateHandle = function(handle, delta) {
			var newpos = handle.startpos + delta;
			newpos = clampPos(newpos, handle.extents);

			var newvalue = (handle.valperpixel * newpos) + handle.min;
			handle.updateModel(newvalue);

			newpos = (handle.value - handle.min) / handle.valperpixel;
			handle.element.css("left", newpos + "px");
		};

		var mouseMove = function(event) {
			if (dragging === bar_handle) {
				var pageX = event.pageX || event.originalEvent.touches[0].pageX || 0;
				var delta = pageX - dragstart;
				updateHandle(handles.start, delta);
				updateHandle(handles.finish, delta);
				updateBar();

			} else if (dragging) {
				var pageX = event.pageX || event.originalEvent.touches[0].pageX || 0;
				updateHandle(dragging, pageX - dragstart);
				updateBar();
			}
		};


		var mouseUp = function(event) {
			if (dragging)
				dragging = null;
		};

		angular.forEach(handles, function(handle, key) {
			element.append(handle.element);

			handle.element.on("mousedown touchstart", function(event) {
				event.preventDefault();
				event.stopPropagation();

				getExtents(handle);

				dragging = handle;
				dragstart = event.pageX || event.originalEvent.touches[0].pageX || 0;

				element.focus();
				// Because triggering focus resets the selected handle to start, we need to fix the classes
				focused = key;
				setFocusClass();
			});

			handle.updateModel = function(value) {
				// Lock to step position
				handle.value = Math.round(value / handle.step) * handle.step;

				ngModel.$modelValue[key] = handle.value;
				ngModel.$setViewValue(angular.copy(ngModel.$modelValue));
			};

			var valueChanged = function(newvalue, oldvalue) {
				handle.value = newvalue;

				// Make sure the background element is visible
				if (!background.width()) {
					setTimeout(function() {
						valueChanged(newvalue, oldvalue);
					}, 10);
					return;
				}

				if (!handle.valperpixel)
					getExtents(handle);

				var startingpos = (handle.value - handle.min) / handle.valperpixel;
				handle.element.css("left", startingpos + "px");

				updateBar(handle);
			};

			$scope.$watch(attrs.ngModel + "." + key, valueChanged);
		});

		var startBarDrag = function(event) {
			getExtents(handles.start);
			getExtents(handles.finish);
			dragging = bar_handle;
			dragstart = event.pageX || event.originalEvent.touches[0].pageX || 0;

			element.focus();
			// Because triggering focus resets the selected handle to start, we need to fix the classes
			focused = "start";
			setFocusClass();
		};

		bar.on("mousedown touchstart", function(event) {
			event.preventDefault();
			event.stopPropagation();

			if (!isInverted()) startBarDrag(event);
		});
		tickmarks_range.on("mousedown touchstart", function(event) {
			event.preventDefault();
			event.stopPropagation();

			if (!isInverted()) startBarDrag(event);
		});

		background.on("mousedown touchstart", function(event) {
			event.preventDefault();
			event.stopPropagation();

			if (isInverted()) startBarDrag(event);
		});
		tickmarks.on("mousedown touchstart", function(event) {
			event.preventDefault();
			event.stopPropagation();

			if (isInverted()) startBarDrag(event);
		});

		element.click(function(event) {
			// Set focus to first handle
			focused = "start";
		});

		// Process keyboard shortcuts
		element.on("keydown", function(event) {
			switch (event.which) {
				case 9:	// Tab
					if (range) {
						if ((focused == "start") && !event.shiftKey) {
							event.stopImmediatePropagation();
							event.preventDefault();

							focused = "finish";
							setFocusClass();
						}
						else if ((focused == "finish") && event.shiftKey) {
							event.stopImmediatePropagation();
							event.preventDefault();

							focused = "start";
							setFocusClass();
						}
					}
					break;

				case 13:	// Enter
					event.stopPropagation();
					event.preventDefault();

					// Allow the element to treat an enter as a tab
					var tabEvent = jQuery.Event("keydown");
					tabEvent.which = 9;
					element.trigger(tabEvent);

					break;

				case 35:	// End
					event.stopPropagation();
					event.preventDefault();

					getExtents(handles[focused]);
					handles[focused].updateModel(handles[focused].max);

					break;

				case 36:	// Home
					event.stopPropagation();
					event.preventDefault();

					getExtents(handles[focused]);
					handles[focused].updateModel(handles[focused].min);

					break;

				case 39:	// Cursor right
					event.stopPropagation();
					event.preventDefault();

					getExtents(handles[focused]);
					handles[focused].updateModel(Math.min(handles[focused].value + handles[focused].step, handles[focused].max));

					break;

				case 37:	// Cursor left
					event.stopPropagation();
					event.preventDefault();

					getExtents(handles[focused]);
					handles[focused].updateModel(Math.max(handles[focused].value - handles[focused].step, handles[focused].min));

					break;
			}
		});

		var setFocusClass = function(clear) {
			angular.forEach(handles, function(handle, key) {
				handle.element.removeClass("focus");
			});
			if (!clear)
				handles[focused].element.addClass("focus");
		};


		element.focus(function(event) {
			focused = "start";
			setFocusClass();
		});

		element.blur(function(event) {
			setFocusClass(true);
		});

		$window.on("mousemove touchmove", mouseMove);
		$window.on("mouseup touchend", mouseUp);
		$window.on("touchcancel", mouseUp);

		// Tidy up our window listeners
		element.on("$destroy", function() {
			$window.unbind("mousemove", mouseMove);
			$window.unbind("mouseup", mouseUp);
		});
	};

	return {
		restrict: "E",
		require: "^ngModel",
		link: link
	};
}]);
