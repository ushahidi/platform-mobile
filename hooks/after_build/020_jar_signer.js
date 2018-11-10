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

function runJarSigner() {
  process.stdout.write('runJarSigner');
  if (project && config) {
    var apk = "platforms/android/app/build/outputs/apk/release/app-release.apk";
    if (fs.existsSync(root + "/" + apk)) {
      var json = root + "/projects/" + project + "/build.json";
      if (fs.existsSync(json)) {
        var build = require(json);
        var keystore = root + "/projects/ushahidi.keystore";
        var alias = build['android']['release']['alias'];
        var password = build['android']['release']['password'];
        var storePassword = build['android']['release']['storePassword'];
        var command = "jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore " + keystore + " -storepass " + storePassword + " -keypass " + password + " " + apk + " " + alias;
        process.stdout.write(command);
        exec(command, puts);
      }
      else {
        process.stdout.write("runJarSigner File " + json + " does not exist");
      }
    }
    else {
      process.stdout.write("runJarSigner APK " + apk + " does not exist");
    }
  }
}

if (project != null && config != null && platform === 'android') {
  runJarSigner();
}
