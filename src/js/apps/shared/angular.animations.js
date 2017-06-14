/******************************************************************************************

Angular Animations for use in common apps

******************************************************************************************/

require("./animations/slide-view.js");
require("./animations/fade.js");
require("./animations/slide-down.js");
require("./animations/drawer-down.js");

var app = angular.module("alchemytec.animations", [
	"alchemytec.animate.slideview",
	"alchemytec.animate.fade",
	"alchemytec.animate.slidedown",
	"alchemytec.animate.drawerdown"
]);
