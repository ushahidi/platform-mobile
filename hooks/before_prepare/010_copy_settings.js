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

function copyProjectFile() {
  process.stdout.write('copyProjectFile');
  var source = path.join(root, 'projects', project + '.json');
  var destination = path.join(root, 'src', 'assets', 'data', 'settings.json');
  if (fs.existsSync(source)) {
    fs.createReadStream(source).pipe(
      fs.createWriteStream(destination));
  }
}

copyProjectFile();
