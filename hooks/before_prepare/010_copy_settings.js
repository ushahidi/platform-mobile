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

function copyProjectFile() {
  process.stdout.write('copyProjectFile');
  var source = path.join(root, 'projects', project + '.json');
  var destination = path.join(root, 'src', 'assets', 'data', 'settings.json');
  if (fs.existsSync(source)) {
    fs.createReadStream(source).pipe(
      fs.createWriteStream(destination));
  }
}

function changeThemeVariables() {
  process.stdout.write('changeThemeVariables');
  themeFile = path.join(root, 'src', 'theme', 'variables.scss');
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

changeThemeVariables();
copyProjectFile();
