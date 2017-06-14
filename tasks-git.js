/******************************************************************************************

Git related tasks for gulp build

******************************************************************************************/

var package = require("./package.json");
var config = require("./config.js");
var gulp = require("gulp");
var git = require("gulp-git");
var del = require("del");
var settings = require("./settings.js");

// Get the latest commit hash
gulp.task("gitinfo", [], function(done) {
	git.revParse({ args: "--short HEAD" }, function(error, output) {
		if (error)
			stream.emit("error", new gutil.PluginError("gulp-git", error));
		else
			settings.githash = output;

		// Because Buildkite checks out a commit, git revparse will always return HEAD
		if (process.env.BUILDKITE_BRANCH) {
			settings.gitbranch = process.env.BUILDKITE_BRANCH;
			done();

			return;
		}

		git.revParse({ args: "--abbrev-ref HEAD" }, function(error, output) {
			if (error)
				stream.emit("error", new gutil.PluginError("gulp-git", error));
			else
				settings.gitbranch = output;

			done();
		});
	});
});
