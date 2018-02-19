#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var root = process.argv[2];
var platform = process.env.CORDOVA_PLATFORMS;
var project = null;
var config = null;
if (process.env.project) {
  project = process.env.project;
  config = require(root + '/projects/' + project + '.json');
}

function puts(error, stdout, stderr) {
  console.log(stdout);
}

function runZipAlign() {
  process.stdout.write('runZipAlign');
  var input = "platforms/android/build/outputs/apk/release/android-release.apk";
  var output = "platforms/android/build/outputs/apk/release/" + config.appName.replace(/ /g,"_") + ".apk";
  if (fs.existsSync(root + "/" + input)) {
    var command = "./zipalign -f -v 4 " + input + " " + output;
    process.stdout.write(command);
    exec(command, puts);
    process.stdout.write("runZipAlign APK " + output + " aligned");
  }
  else {
    process.stdout.write("runZipAlign APK " + input + " does not exist");
  }
}

if (project != null && config != null && platform === 'android') {
  runZipAlign();
}
