/******************************************************************************************

Slide down/up animations

******************************************************************************************/

var app = angular.module("alchemytec.animate.slidedown", ["ngAnimate"]);

app.animation(".animate-slidedown", ["$animateCss", function($animateCss) {
	var animationSpeed = 0.25;

	var slideDown = function(element, done) {
		element.show();
		var eleHeight = element.height();
		element.hide();

		// Configure the slide down animation
		var animator = $animateCss(element, {
			from: {
				height: "0px"
			},
			to: {
				height: eleHeight + "px"
			},
			easing: "ease-out",
			duration: animationSpeed
		});

		element.css({
			display: element.hasClass("animate-inline-block") ? "inline-block" : "block",
			overflow: "hidden",
			transform: "translate3d(0,0,0)"
		});

		// Start the animation
		animator.start().done(function() {
			element.css({
				height: "auto",
				overflow: element.hasClass("animate-overflow-auto") ? "auto" : "visible"
			});
			element.focus();
			done();
		});

		// Handle any animation cleanup operations
		return function(cancelled) {
			if (cancelled)
				animator.end();
		};
	};

	var slideUp = function(element, done) {
		var eleHeight = element.height();

		// Configure the slide up animation
		var animator = $animateCss(element, {
			from: {
				height: eleHeight + "px"
			},
			to: {
				height: "0px"
			},
			easing: "ease-in",
			duration: animationSpeed
		});

		element.css({
			overflow: "hidden",
			transform: "translate3d(0,0,0)"
		});

		// Start the animation
		animator.start().done(function() {
			element.css({
				display: "none",
				height: "auto",
				overflow: "visible"
			});

			done();
		});

		// Handle any animation cleanup operations
		return function(cancelled) {
			if (cancelled)
				animator.end();
		};
	};

	return {
		enter: function(element, done) {
			return slideDown(element, done);
		},
		leave: function(element, done) {
			return slideUp(element, done);
		}
	};
}]);
