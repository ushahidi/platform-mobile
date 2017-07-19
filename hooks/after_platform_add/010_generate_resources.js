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

function puts(error, stdout, stderr) {
  console.log(stdout);
}

function generateResourceImages() {
  process.stdout.write("generateResourceImages");
  exec("ionic resources", puts);
}

function installCordovaIosSim() {
  process.stdout.write("installCordovaIosSim");
  exec("cd platforms/ios/cordova && npm install ios-sim", puts)
}

generateResourceImages();

if (platform === 'ios') {
  installCordovaIosSim();
}
