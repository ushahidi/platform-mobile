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

function generateResourceImages() {
  process.stdout.write("generateResourceImages" + "\n");
  exec("ionic cordova resources --force", puts);
}

function installCordovaIosSim() {
  process.stdout.write("installCordovaIosSim" + "\n");
  exec("cd platforms/ios/cordova && npm install ios-sim", puts)
}

generateResourceImages();

if (platform === 'ios') {
  installCordovaIosSim();
}
