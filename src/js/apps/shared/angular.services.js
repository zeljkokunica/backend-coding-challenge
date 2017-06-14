"use strict";

/******************************************************************************************

Angular Services for use in common apps

******************************************************************************************/

require("./services/restalchemy.js");
require("./services/notifications.js");
require("./services/overlay.js");
require("./services/confirmations.js");
require("./services/dialog.js");
require("./services/constructs.js");
require("./services/configuration.js");

var app = angular.module("alchemytec.services", [
	"alchemytec.restalchemy",
	"alchemytec.notifications",
	"alchemytec.overlay",
	"alchemytec.confirmations",
	"alchemytec.modaldialog",
	"alchemytec.constructs",
	"alchemytec.config"
]);
