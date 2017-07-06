#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var rootdir = process.argv[2];
var project = 'ushahidi';
if (process.env.project) {
  project = process.env.project;
}
var config = require(rootdir + '/projects/' + project + '.json');

function copyResourceImage(srcFile, destFile) {
  process.stdout.write('copyResourceImage ' + srcFile + ' to ' + destFile);
  if (fs.existsSync(srcFile)) {
    fs.createReadStream(srcFile).pipe(
      fs.createWriteStream(destFile));
  }
}

function copyResourceImages() {
  copyResourceImage(config.appIcon, "resources/icon.png");
  copyResourceImage(config.appSplash, "resources/splash.png");
  exec("ionic resources");
}

copyResourceImages();
