"use strict";

/******************************************************************************************

Angular construct Service

This service handles the creation and automatic updating of rootscope constructs
such as today, yesterday and tomorrow

******************************************************************************************/

var app = angular.module("alchemytec.constructs", []);

app.service("constructs", ["$interval", function($interval) {
	var updateInterval = 1000 * 60;
	var constructs = {};

	constructs.toMidnight = function(aDate) {
		if (_.isString(aDate) || _.isNumber(aDate))
			aDate = moment.utc(aDate).toDate();

		if (_.isDate(aDate))
			aDate.setUTCHours(0, 0, 0, 0);
		
		return aDate;
	};

	var updateConstructs = function() {
		constructs.now = new Date();
		constructs.nowtime = constructs.now.getTime();

		constructs.today = angular.copy(constructs.now);
		constructs.toMidnight(constructs.today);
		constructs.todaytime = constructs.today.getTime();

		constructs.yesterday = angular.copy(constructs.now);
		constructs.toMidnight(constructs.yesterday);
		constructs.yesterday.setUTCDate(constructs.yesterday.getUTCDate() - 1);
		constructs.yesterdaytime = constructs.yesterday.getTime();

		constructs.tomorrow = angular.copy(constructs.now);
		constructs.toMidnight(constructs.tomorrow);
		constructs.tomorrow.setUTCDate(constructs.tomorrow.getUTCDate() + 1);
		constructs.tomorrowtime = constructs.tomorrow.getTime();
	};

	$interval(updateConstructs, updateInterval);
	updateConstructs();

	return constructs;
}]);
