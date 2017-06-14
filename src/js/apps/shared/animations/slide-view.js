/******************************************************************************************

View transition animations

******************************************************************************************/

var app = angular.module("alchemytec.animate.slideview", ["ngAnimate"]);

// If the view-ready event ever hits rootScope, then a controller which sent it may have been created before the
// animation is bound so we need to make sure we trigger our animation straight away
app.run(["$rootScope", function($rootScope) {
	$rootScope.viewAlreadyReady = false;

	$rootScope.$on("view-ready", (event) => {
		$rootScope.viewAlreadyReady = true;
	});
}]);

app.animation(".animate-slide-view", [ "$rootScope", "$timeout", "$animateCss", "overlay", "overlayspinner", "config", "notifications", function($rootScope, $timeout, $animateCss, $overlay, $overlayspinner, $config, $notifications) {
	var $body = angular.element("body");
	var animationSpeed = 0.75;
	var elementCSS = {
		position: "absolute",
		overflow: "auto",
		display: "block",
		transform: "translate3d(0,0,0)"
	};
	var arriving = null;
	var leaving = null;

	var animateContent = function() {
		if (leaving && arriving) {
			// Make sure we reset this for future slide views
			$rootScope.viewAlreadyReady = false;

			// Ensure any previous animation doesn't trigger the view slide callback
			$body.stop();

			// Make sure the page is scrolled to the top
			$body.animate({ scrollTop: "0px" }, function() {
				var $content = angular.element("#content");

				// Check which direction we are going in and reset it to the default
				var modifier = $rootScope.reverseViewAnimation ? -1 : 1;
				$rootScope.reverseViewAnimation = false;

				// Just in case this has been hidden
				arriving.element.show();

				// Fix the element widths to avoid reflows and set their starting positions
				leaving.element.css(angular.extend(elementCSS, {
					width: leaving.element.find("div").first().outerWidth() + "px"
				}));
				arriving.element.css(angular.extend(elementCSS, {
					width: arriving.element.find("div").first().outerWidth() + "px"
				}));

				// Make the content width fixed so we can position the new view hidden nicely
				$content.css({
					position: "relative",
					overflow: "hidden",
					width: $content.width() + "px"
				});

				// Configure the slide out view animation
				var animatorOut = $animateCss(leaving.element, {
					from: {
						transform: "translate(0, 0)"
					},
					to: {
						transform: "translate3d(" + ($content.outerWidth() * -1 * modifier) + "px, 0px, 0px)"
					},
					easing: "ease",
					duration: animationSpeed
				});

				// Configure the slide in view animation
				var animatorIn = $animateCss(arriving.element, {
					from: {
						transform: "translate3d(" + ($content.outerWidth() * modifier) + "px, 0px, 0px)"
					},
					to: {
						transform: "translate(0, 0)"
					},
					easing: "ease",
					duration: animationSpeed
				});

				var callback = arriving.callback;

				// Start the animations
				animatorOut.start().done(leaving.callback);
				animatorIn.start().done(function() {
					$content.css({
						height: "auto",
						overflow: "visible",
						display: "block"
					});
					if (callback)
						callback();
				});

				$content.height(Math.max(arriving.element.outerHeight(), leaving.element.outerHeight()));

				// Clear the vars so another view must be loaded before this is all triggered
				arriving = null;
				leaving = null;
			});
		}
		// Still waiting for both partials to be present so wait for the new one
		else if (leaving || arriving)
			$timeout(animateContent, 100);
	};

	var triggerAnimation = function() {
		animateContent();
		$overlay.hide("slide-view");
		$overlayspinner.hide("slide-view");
	};

	return {
		enter: function(element, done) {
			var $scope = element.find("div").scope();

			// Hide our entering element initially
			element.css({
				display: "none"
			});

			// If a previous arriving view exists, complete the animation on it
			if (arriving)
				arriving.callback();

			// Trigger arriving animation if possible
			arriving = {
				element: element,
				callback: done
			};

			element.hide();
			$overlay.show({ name: "slide-view", delay: 0.75, minimum: 0.25 });
			$overlayspinner.show({ name: "slide-view", delay: 0.75, minimum: 0.25 });

			// See if we missed an animation trigger event
			if ($rootScope.viewAlreadyReady)
				$timeout(triggerAnimation);
			else {
				var readyTimeout = $timeout(function() {
					$notifications.show("Connection issue", "A problem occurred reading data from the server for this page", "error", 5000);
					triggerAnimation();
					readyEvent();
				}, $config.api.timeout);

				var readyEvent = $scope.$on("view-ready", (event) => {
					// When a show event is triggered, should prevent this going any higher and triggering parents
					// to be ready when they may not be
					event.stopPropagation();

					// Make sure the show timeout doesn't happen
					$timeout.cancel(readyTimeout);

					triggerAnimation();
					readyEvent();
				});
			}

			// Handle any animation cleanup operations
			return function(cancelled) {
				if (cancelled)
					angular.element("#content").attr("style", "").resetKeyframe();

				// Reset the element styles
				element.attr("style", "");
			};
		},
		leave: function(element, done) {
			// If a previous leaving view exists, complete the animation on it
			if (leaving)
				leaving.callback();

			leaving = {
				element: element,
				callback: done
			};

			if ($rootScope.viewAlreadyReady)
				$timeout(triggerAnimation);

			// Handle any animation cleanup operations
			return function(cancelled) {
				// Reset the element styles
				element.attr("style", "");
			};
		}
	};
}]);
