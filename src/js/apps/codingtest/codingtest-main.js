"use strict";

/******************************************************************************************

Alchemytec Coding Test for Expenses Back End

******************************************************************************************/

// App files
require("./partials.js");
require("./expenses/main.js");

// Declare app level module which depends on filters, and services
var app = angular.module("alcExpenses", [
	"alcShared",
	"codingtest.partials",
	"expenses.controllers"
]);

app.run(["$rootScope", function($rootScope) {
	// Basic config options
	var gulpBuildConfig = {};
	$rootScope.config = angular.extend({ angular: angular.version.full }, gulpBuildConfig);

	// Headings used by the menu bars
	$rootScope.mainTitle = "";
	$rootScope.mainHeading = "";

	// Sections of content are used for bookmark navigation
	$rootScope.contentSections = [];

	// App sections are distinct areas of the website
	// These will ultimately be retrieved from the server
	$rootScope.appSections = $rootScope.appSections || [];

	// Initialise tab sections
	$rootScope.tabSections = $rootScope.tabSections || {};
	$rootScope.currentSection = [];
	$rootScope.selectTabSection = function(currentSection, selectedIndex) {
		if ($rootScope.tabSections[currentSection]) {
			$rootScope.currentSection = angular.copy($rootScope.tabSections[currentSection]);

			for (var u = 0; u < $rootScope.currentSection.length; u++) {
				if (u == selectedIndex)
					$rootScope.currentSection[u].active = true;
				else
					$rootScope.currentSection[u].active = false;
			}
		}
	};
}]);

// Bootstrap the app
$(document).ready(function() {
	angular.bootstrap("body", ["alcExpenses"]);
});
