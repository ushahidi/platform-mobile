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

function replaceThemeColor(key, hex) {
  if (key && hex) {
    var filename = path.join(root, 'src', 'theme', 'variables.scss');
    var data = fs.readFileSync(filename, 'utf8');
    var regex = key + ':\\s+#(.*?),';
    var result = data.replace(new RegExp(regex, "g"), key + ': ' + hex + ',');
    fs.writeFileSync(filename, result, 'utf8');
  }
}

function replaceStatusBarColor(filename, color) {
  var data = fs.readFileSync(filename, 'utf8');
  var regex = /<preference name="StatusBarBackgroundColor" value="(.*?)" \/>/g;
  var result = data.replace(regex, '<preference name="StatusBarBackgroundColor" value="'+color+'" />');
  fs.writeFileSync(filename, result, 'utf8');
}

function changeConfigFile() {
  process.stdout.write('changeConfigFile');
  var configFile = path.join(root, 'config.xml');
  replaceStatusBarColor(configFile, config.colorNavbar);
}

function changeThemeVariables() {
  process.stdout.write('changeThemeVariables');
  themeFile = path.join(root, 'src', 'theme', 'variables.scss');
  replaceThemeColor("navbar", config.colorNavbar);
  replaceThemeColor("toolbar", config.colorToolbar);
  replaceThemeColor("primary", config.colorPrimary);
  replaceThemeColor("secondary", config.colorSecondary);
  replaceThemeColor("dark", config.colorDark);
  replaceThemeColor("light", config.colorLight);
  replaceThemeColor("danger", config.colorDanger);
  replaceThemeColor("active", config.colorActive);
  replaceThemeColor("highlight", config.colorHighlight);
  replaceThemeColor("background", config.colorBackground);
}

function copyProjectFile() {
  process.stdout.write('copyProjectFile');
  var source = path.join(root, 'projects', project + '.json');
  var destination = path.join(root, 'src', 'assets', 'data', 'settings.json');
  if (fs.existsSync(source)) {
    fs.createReadStream(source).pipe(
      fs.createWriteStream(destination));
  }
}

if (project != null && config != null) {
  changeThemeVariables();
  changeConfigFile();
  copyProjectFile();
}
