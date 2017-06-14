/******************************************************************************************

Drawer down/up animations

******************************************************************************************/

var app = angular.module("alchemytec.animate.drawerdown", ["ngAnimate"]);

app.animation(".animate-drawerdown", ["$animateCss", function($animateCss) {
	var animationSpeed = 0.25;

	var drawerDown = function(element, done) {
		var animElement = element.children().first();

		element.show();
		var eleHeight = element.outerHeight();

		// Configure the drawer down animation
		var animator = $animateCss(animElement, {
			from: {
				"margin-top": -eleHeight + "px"
			},
			to: {
				"margin-top": "0px"
			},
			easing: "ease-out",
			duration: animationSpeed
		});

		element.css({
			transform: "translate3d(0,0,0)"
		});
		animElement.css({
			transform: "translate3d(0,0,0)"
		});

		// Start the animation
		animator.start().done(function() {
			element.css({
				"margin-top": "0px"
			});

			done();
		});

		// Handle any animation cleanup operations
		return function(cancelled) {
			if (cancelled)
				animator.end();
		};
	};

	var drawerUp = function(element, done) {
		var animElement = element.children().first();
		var eleHeight = element.outerHeight();

		// Configure the drawer up animation
		var animator = $animateCss(animElement, {
			from: {
				"margin-top": "0px"
			},
			to: {
				"margin-top": -eleHeight + "px"
			},
			easing: "ease-out",
			duration: animationSpeed
		});

		element.css({
			transform: "translate3d(0,0,0)"
		});
		animElement.css({
			transform: "translate3d(0,0,0)"
		});

		// Start the animation
		animator.start().done(function() {
			animElement.css({
				"margin-top": "0px"
			});
			element.hide();

			done();
		});

		// Handle any animation cleanup operations
		return function(cancelled) {
			if (cancelled)
				animator.end();
		};
	};

	return {
		addClass: function(element, className, done) {
			return drawerDown(element, done);
		},
		removeClass: function(element, className, done) {
			return drawerUp(element, done);
		},
		enter: function(element, done) {
			return drawerDown(element, done);
		},
		leave: function(element, done) {
			return drawerUp(element, done);
		}
	};
}]);
