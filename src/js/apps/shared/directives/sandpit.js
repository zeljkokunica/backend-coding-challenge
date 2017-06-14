/******************************************************************************************

Angular sandpit Directive

This directive creates a sandboxed iframe which automatically resizes in height to fix its contents

Usage: <at-sandpit at-content="task.email"><at-sandpit>
	this would show a sandboxed iframe containing the contents of the task.email object

******************************************************************************************/

var app = angular.module("alchemytec.sandpit", []);

app.directive("atSandpit", [ "config", function($config) {
	var $window = angular.element(window);

	var link = function($scope, element, attrs) {
		// Get the current domain name
		var srcHostname = window.location.host.split(".");
		var iframeLoaded = false;
		var fillData = null;

		// Remove the bottom-most subdomain
		srcHostname.shift();
		// Replace with the email sandbox subdomain
		srcHostname.unshift($config.emailsandbox.subdomain);

		// Build the sandbox url and create the iframe element
		var srcUrl = window.location.protocol + "//" + srcHostname.join(".") + "/" + $config.emailsandbox.file;
		var iFrame = angular.element("<iframe frameBorder='0' sandbox='allow-scripts'></iframe>");
		element.replaceWith(iFrame);

		iFrame.on("load", function(event) {
			iframeLoaded = true;
			if (fillData)
				iFrame[0].contentWindow.postMessage({ event: "showEmail", data: fillData }, "*");
		});
		iFrame.attr("src", srcUrl);

		$scope.$watch(attrs.atContent, function(newvalue, oldvalue) {
			if (newvalue) {
				if (iframeLoaded)
					iFrame[0].contentWindow.postMessage({ event: "showEmail", data: fillData }, "*");
				else
					fillData = newvalue;
			}
		});

		var messageFunc = function(event) {
			var msgObj = event.originalEvent.data;

			switch (msgObj.event) {
				case "resizeEmail":
					iFrame.height(msgObj.height);
			}
		};
		$window.on("message", messageFunc);

		element.on("$destroy", function() {
			$window.unbind("message", messageFunc);
		});
	};

	return {
		restrict: "E",
		link: link
	};
} ]);
