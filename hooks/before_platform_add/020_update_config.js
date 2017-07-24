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

function replaceStringInFile(filename, to_replace, replace_with) {
  var data = fs.readFileSync(filename, 'utf8');
  var result = data.replace(new RegExp(to_replace, 'g'), replace_with);
  fs.writeFileSync(filename, result, 'utf8');
}

function replaceIdInFile(filename, id) {
  var data = fs.readFileSync(filename, 'utf8');
  var regex = /id="(.*?)"/g;
  var result = data.replace(regex, 'id="'+id+'"');
  fs.writeFileSync(filename, result, 'utf8');
}

function replaceNameInFile(filename, name) {
  var data = fs.readFileSync(filename, 'utf8');
  var regex = /<name>(.*?)<\/name>/g;
  var result = data.replace(regex, '<name>'+name+'</name>');
  fs.writeFileSync(filename, result, 'utf8');
}

function replaceDescriptionInFile(filename, description) {
  var data = fs.readFileSync(filename, 'utf8');
  var regex = /<description>(.*?)<\/description>/g;
  var result = data.replace(regex, '<description>'+description+'</description>');
  fs.writeFileSync(filename, result, 'utf8');
}

function replaceDeepLinkSecureInFile(filename, secure) {
  if (secure) {
    var data = fs.readFileSync(filename, 'utf8');
    var regex = /"DEEPLINK_SCHEME": "(.*?)"/g;
    var result = data.replace(regex, '"DEEPLINK_SCHEME": "'+secure+'"');
    fs.writeFileSync(filename, result, 'utf8');
  }
}

function replaceDeepLinkDomainInFile(filename, domain) {
  if (domain) {
    var data = fs.readFileSync(filename, 'utf8');
    var regex = /"DEEPLINK_HOST": "(.*?)"/g;
    var result = data.replace(regex, '"DEEPLINK_HOST": "'+domain+'"');
    fs.writeFileSync(filename, result, 'utf8');
  }
}

function replaceDeepLinkProtocolInFile(filename, protocol) {
  if (protocol) {
    var data = fs.readFileSync(filename, 'utf8');
    var regex = /"URL_SCHEME": "(.*?)"/g;
    var result = data.replace(regex, '"URL_SCHEME": "'+protocol+'"');
    fs.writeFileSync(filename, result, 'utf8');
  }
}

function changeConfigFile() {
  process.stdout.write('changeConfigFile');
  var configFile = path.join(root, 'config.xml');
  replaceIdInFile(configFile, config.appId);
  replaceNameInFile(configFile, config.appName);
  replaceDescriptionInFile(configFile, config.appDescription);
}

function changePackageFile() {
  process.stdout.write('changePackageFile');
  var packageFile = path.join(root, 'package.json');
  replaceDeepLinkSecureInFile(packageFile, config.deepLinkSecure);
  replaceDeepLinkDomainInFile(packageFile, config.deepLinkDomain);
  replaceDeepLinkProtocolInFile(packageFile, config.deepLinkProtocol);
}

changeConfigFile();
changePackageFile();
