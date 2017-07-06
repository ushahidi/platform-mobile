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

function replacePackageInFile(filename, value) {
  var data = fs.readFileSync(filename, 'utf8');
  var regex = /package="(.*?)"/g;
  var result = data.replace(regex, 'package="'+value+'"');
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

function replaceBundleNameInFile(filename, bundle) {
  var data = fs.readFileSync(filename, 'utf8');
  var regex = /<key>CFBundleName<\/key>[\n\r\s]+<string>(.*?)<\/string>/g;
  var result = data.replace(regex, '<key>CFBundleName</key>\n<string>'+bundle+'</string>');
  fs.writeFileSync(filename, result, 'utf8');
}

function replaceBundleDisplayNameInFile(filename, bundle) {
  var data = fs.readFileSync(filename, 'utf8');
  var regex = /<key>CFBundleDisplayName<\/key>[\n\r\s]+<string>(.*?)<\/string>/g;
  var result = data.replace(regex, '<key>CFBundleDisplayName</key>\n<string>'+bundle+'</string>');
  fs.writeFileSync(filename, result, 'utf8');
}

function replaceBundledIdentifierInFile(filename, bundle) {
  var data = fs.readFileSync(filename, 'utf8');
  var regex = /<key>CFBundleIdentifier<\/key>[\n\r\s]+<string>(.*?)<\/string>/g;
  var result = data.replace(regex, '<key>CFBundleIdentifier</key>\n<string>'+bundle+'</string>');
  fs.writeFileSync(filename, result, 'utf8');
}

function replaceColorNavbarInFile(filename, hex) {
  var data = fs.readFileSync(filename, 'utf8');
  var regex = /navbar:[\s]+#(.*?),/g;
  var result = data.replace(regex, 'navbar: '+hex+',');
  fs.writeFileSync(filename, result, 'utf8');
}

function replaceColorToolbarInFile(filename, hex) {
  var data = fs.readFileSync(filename, 'utf8');
  var regex = /toolbar:[\s]+#(.*?),/g;
  var result = data.replace(regex, 'toolbar: '+hex+',');
  fs.writeFileSync(filename, result, 'utf8');
}

function replaceColorPrimaryInFile(filename, hex) {
  var data = fs.readFileSync(filename, 'utf8');
  var regex = /primary:[\s]+#(.*?),/g;
  var result = data.replace(regex, 'primary: '+hex+',');
  fs.writeFileSync(filename, result, 'utf8');
}

function replaceColorSecondaryInFile(filename, hex) {
  var data = fs.readFileSync(filename, 'utf8');
  var regex = /secondary:[\s]+#(.*?),/g;
  var result = data.replace(regex, 'secondary: '+hex+',');
  fs.writeFileSync(filename, result, 'utf8');
}

function replaceColorDarkInFile(filename, hex) {
  var data = fs.readFileSync(filename, 'utf8');
  var regex = /dark:[\s]+#(.*?),/g;
  var result = data.replace(regex, 'dark: '+hex+',');
  fs.writeFileSync(filename, result, 'utf8');
}

function replaceColorLightInFile(filename, hex) {
  var data = fs.readFileSync(filename, 'utf8');
  var regex = /light:[\s]+#(.*?),/g;
  var result = data.replace(regex, 'light: '+hex+',');
  fs.writeFileSync(filename, result, 'utf8');
}

function replaceColorDangerInFile(filename, hex) {
  var data = fs.readFileSync(filename, 'utf8');
  var regex = /danger:[\s]+#(.*?),/g;
  var result = data.replace(regex, 'danger: '+hex+',');
  fs.writeFileSync(filename, result, 'utf8');
}

function replaceColorActiveInFile(filename, hex) {
  var data = fs.readFileSync(filename, 'utf8');
  var regex = /active:[\s]+#(.*?),/g;
  var result = data.replace(regex, 'active: '+hex+',');
  fs.writeFileSync(filename, result, 'utf8');
}

function replaceColorHighlightInFile(filename, hex) {
  var data = fs.readFileSync(filename, 'utf8');
  var regex = /highlight:[\s]+#(.*?),/g;
  var result = data.replace(regex, 'highlight: '+hex+',');
  fs.writeFileSync(filename, result, 'utf8');
}

function replaceColorBackgroundInFile(filename, hex) {
  var data = fs.readFileSync(filename, 'utf8');
  var regex = /background:[\s]+#(.*?),/g;
  var result = data.replace(regex, 'background: '+hex+',');
  fs.writeFileSync(filename, result, 'utf8');
}

function changeIosConfigFile() {
  process.stdout.write('changeIosConfigFile');
  var configFile = path.join(rootdir, 'platforms', 'ios', 'Ushahidi', 'config.xml');
  replaceIdInFile(configFile, config.appId);
  replaceNameInFile(configFile, config.appName);
  replaceDescriptionInFile(configFile, config.appDescription);
}

function changeIosPlistFile() {
  process.stdout.write('changeIosPlistFile');
  var plistFile = path.join(rootdir, 'platforms', 'ios', 'Ushahidi', 'Ushahidi-Info.plist');
  replaceBundleNameInFile(plistFile, config.appName);
  replaceBundleDisplayNameInFile(plistFile, config.appName);
  replaceBundledIdentifierInFile(plistFile, config.appId);
}

function changeAndroidManifestFile() {
  process.stdout.write('changeAndroidManifestFile');
  var configFile = path.join(rootdir, 'platforms', 'android', 'AndroidManifest.xml');
  replacePackageInFile(configFile, config.appId);
}

function changeAndroidResourceFile() {
  process.stdout.write('changeAndroidResourceFile');
  var resFile = path.join(rootdir, 'platforms', 'android', 'res', 'values', 'strings.xml');
  replaceStringInFile(resFile, 'Ushahidi', config.appName);
}

function changeThemeVariables() {
  process.stdout.write('changeThemeVariables');
  themeFile = path.join(rootdir, 'src', 'theme', 'variables.scss');
  if (config.colorNavbar) {
    replaceColorNavbarInFile(themeFile, config.colorNavbar);
  }
  if (config.colorToolbar) {
    replaceColorToolbarInFile(themeFile, config.colorToolbar);
  }
  if (config.colorPrimary) {
    replaceColorPrimaryInFile(themeFile, config.colorPrimary);
  }
  if (config.colorSecondary) {
    replaceColorSecondaryInFile(themeFile, config.colorSecondary);
  }
  if (config.colorDark) {
    replaceColorDarkInFile(themeFile, config.colorDark);
  }
  if (config.colorLight) {
    replaceColorLightInFile(themeFile, config.colorLight);
  }
  if (config.colorDanger) {
    replaceColorDangerInFile(themeFile, config.colorDanger);
  }
  if (config.colorActive) {
    replaceColorActiveInFile(themeFile, config.colorActive);
  }
  if (config.colorHighlight) {
    replaceColorHighlightInFile(themeFile, config.colorHighlight);
  }
  if (config.colorBackground) {
    replaceColorBackgroundInFile(themeFile, config.colorBackground);
  }
}

function copyProjectFile() {
  process.stdout.write('copyProjectFile');
  var srcFile = path.join(rootdir, 'projects', project + '.json');
  var destFile = path.join(rootdir, 'www', 'assets', 'data', 'settings.json');
  if (fs.existsSync(srcFile)) {
    fs.createReadStream(srcFile).pipe(
      fs.createWriteStream(destFile));
  }
}

var platform = process.env.CORDOVA_PLATFORMS;

if (platform.indexOf(',') !== -1) {
  throw new Error('This script does not handle multiple platforms at the moment');
}

if (platform === 'ios') {
  changeIosConfigFile();
  changeIosPlistFile();
  changeThemeVariables();
  copyProjectFile();
}

if (platform === 'android') {
  changeAndroidManifestFile();
  changeAndroidResourceFile();
  changeThemeVariables();
  copyProjectFile();
}
