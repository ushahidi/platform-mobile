#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var root = process.argv[2];
var platform = process.env.CORDOVA_PLATFORMS;
var project = 'ushahidi';
if (process.env.project) {
  project = process.env.project;
}
var config = require(root + '/projects/' + project + '.json');

function runZipAlign() {
  process.stdout.write('runZipAlign');
  var input = "platforms/android/build/outputs/apk/android-release.apk";
  var output = "platforms/android/build/outputs/apk/" + config.appName.replace(/ /g,"_") + ".apk";
  if (fs.existsSync(root + "/" + input)) {
    var command = "./zipalign -f -v 4 " + input + " " + output;
    process.stdout.write(command);
    exec(command);
    process.stdout.write("APK file " + output + " aligned");
  }
  else {
    process.stdout.write("APK file " + input + " does not exist");
  }
}

if (platform === 'android') {
  runZipAlign();
}
