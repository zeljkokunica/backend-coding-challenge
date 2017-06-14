/******************************************************************************************

Main Javascript functionality on every page

******************************************************************************************/

// Substitute fake console object for IE9 or lower
if (!window.console)
	window.console = {};
if (!window.console.log)
	window.console.log = function() { };

// Strip query params before angular gets bootstrapped if this contains the cache buster
if (window.location.search.match("cache="))
	window.history.pushState(null, "", window.location.pathname + window.location.hash);

// Set document domain so subdomains can share cookies and storage
//document.domain = document.domain.split(".").slice(1).join(".");

// General libraries
window.$ = window.jQuery = require("../../libs/jquery/jquery-2.2.2.min.js");
window.jQuery = window.$;
window._ = require("../../libs/lodash/lodash.min.js");
window.moment = require("../../libs/moment/moment.min.js");
window.Big = require("../../libs/bigjs/big.min.js");

// Commonly used third party Angular modules
require("../../libs-angular/angular/angular.min.js");
require("../../libs-angular/angular/angular-touch.min.js");
require("../../libs-angular/angular/angular-route.min.js");
require("../../libs-angular/angular/angular-animate.min.js");
require("../../libs-angular/angular/angular-sanitize.min.js");

// Commonly used custom Angular modules
require("./angular.directives.js");
require("./angular.services.js");
require("./angular.filters.js");
require("./angular.animations.js");

require("./partials.js");
require("./navigation/navigation-controllers.js");
require("./navigation/navigation-directives.js");
require("./information/version-controller.js");

// Declare app level module which depends on filters, and services
var app = angular.module("alcShared", [
	"ngRoute",
	"ngAnimate",
	"ngSanitize",
	"alchemytec.directives",
	"alchemytec.filters",
	"alchemytec.animations",
	"alchemytec.services",
	"shared.partials",
	"navigation.directives",
	"navigation.controllers",
	"version.controller"
]);

app.config(["$routeProvider", function($routeProvider) {
	// Global routes
	$routeProvider.when("/version", { templateUrl: "shared/version-content.html" });
}]);


// These things are done on every page if required, such as error popups
$(document).ready(function() {
	//fastclick(document.body);
});
