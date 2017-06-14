/******************************************************************************************

Fade in/out animation

******************************************************************************************/

var app = angular.module("alchemytec.animate.fade", ["ngAnimate"]);

app.animation(".animate-fade", ["$timeout", "$animateCss", function($timeout, $animateCss) {
	var animationSpeed = 0.2;
	var animationFunction = "ease";

	var fadeIn = function(element, done) {
		var transform = element.hasClass("no-transform") ? "none" : "translate3d(0,0,0)";

		element.css({
			display: element.data("css-display") || "block",
			transform: transform,
			transition: "opacity 1s"
		});

		var duration = animationSpeed;
		if (element.attr("duration"))
			duration = element.attr("duration");

		// Trigger a custom event in case the element needs to alter scrollTop or size
		element.trigger("animate-fade-in-begin");

		// Configure the fade in animation
		var animator = $animateCss(element, {
			from: {
				opacity: 0
			},
			to: {
				opacity: 1
			},
			easing: "ease-out",
			duration: duration
		});

		// Start the animation
		animator.start().done(() => {
			element.css({
				transform: "none"
			});

			done();
		});

		// Handle any animation cleanup operations
		return function(cancelled) {
			if (cancelled)
				animator.end();
		};
	};

	var fadeOut = function(element, done) {
		var currentDisplay = element.css("display");

		// We only want to save the current display property if it is set
		if (currentDisplay && (currentDisplay != "none"))
			element.data("css-display", element.css("display"));

		// Configure the fade out animation
		var animator = $animateCss(element, {
			from: {
				opacity: 1
			},
			to: {
				opacity: 0
			},
			easing: "ease-in",
			duration: animationSpeed
		});

		// Start the animation
		animator.start().done(() => {
			element.css({
				display: "none",
				opacity: 0
			});

			done();
		});

		// Trigger a custom event in case the element needs to do something
		element.trigger("animate-fade-out-begin");

		// Handle any animation cleanup operations
		return function(cancelled) {
			if (cancelled)
				animator.end();
		};
	};

	return {
		addClass: function(element, className, done) {
			return fadeIn(element, done);
		},
		removeClass: function(element, className, done) {
			return fadeOut(element, done);
		},
		enter: function(element, done) {
			return fadeIn(element, done);
		},
		leave: function(element, done) {
			return fadeOut(element, done);
		}
	};
}]);
