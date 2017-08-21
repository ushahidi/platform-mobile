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

function copyResourceImage(source, destination) {
  process.stdout.write('copyResourceImage ' + source + ' to ' + destination + "\n");
  if (fs.existsSync(source)) {
    fs.createReadStream(source).pipe(
      fs.createWriteStream(destination));
  }
}

function copyResourceImages() {
  copyResourceImage(config.appIcon, "resources/icon.png");
  copyResourceImage(config.appSplash, "resources/splash.png");
}

copyResourceImages();
