#!/usr/bin/env node

const translate = require('google-translate-api');
var languages = ['ar', 'fr', 'es', 'de', 'pt', 'ru', 'nl', 'sw', 'it', 'sq', 'my', 'ht', 'vi'];
var fs = require('fs');
var path = require('path');
var root = process.argv[2];
var assets = root + "/src/assets/i18n/";
var input = assets + "en.json";
var english = require(input);
if (process.env.project) {
  project = process.env.project;
  config = require(root + '/projects/' + project + '.json');
}

var openFile = function(path) {
  return new Promise((resolve, reject) => {
    fs.open(path, 'rs+', (err, fd) => {
      resolve(fd);
    });
  });
};
var startFile = function(path) {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, "{", 'utf8', (res) => {
      resolve();
    });
  });
};
var closeFile = function(path, fd) {
  return new Promise((resolve, reject) => {
    fs.appendFile(path, "\n}", 'utf8', (res) => {
      if (fd) {
        fs.close(fd, () => {
          resolve();
        });
      }
      else {
        resolve();
      }
    });
  });
};
var writeFile = function(path, line) {
  return new Promise((resolve, reject) => {
    fs.appendFile(path, line, 'utf8', (res) => {
      resolve(true);
    });
  });
};
var googleTranslate = function(path, language, key, value, comma) {
  return new Promise((resolve, reject) => {
    translate(value, {to:language}).then(
      (translation) => {
        let newline = comma ? ",\n" : "\n";
        let line = newline + JSON.stringify(key) + ": " + JSON.stringify(translation.text);
        resolve(line);
      },
      (error) => {
        reject(error);
      });
  });
};
if (process.env.translate) {
  for (let language of languages) {
    let path = assets + language + ".json";
    openFile(path).then((fd) => {
      startFile(path).then(() => {
        let promise = Promise.resolve(false);
        for (let key in english) {
          let value = english[key];
          promise = promise.then((comma) => {
            return googleTranslate(path, language, key, value, comma);
          }).then((line) => {
            return writeFile(path, line);
          });
        }
        promise.then((done)=> {
          return closeFile(path, fd);
        });
      });
    });
  }
}

function cleanTranslationFiles() {
  process.stdout.write("cleanTranslationFiles" + "\n");
  var directory = path.join(root, 'www', 'assets', 'i18n');
  fs.readdir(directory, function(err, items) {
    for (var item of items) {
      if (item.endsWith("_.json")) {
        var file = directory + "/" + item;
        fs.unlink(file, function(err) {
          if (err) {
            process.stdout.write(`cleanTranslationFiles ${file} Failed` + "\n");
          }
          else {
            process.stdout.write(`cleanTranslationFiles ${file} Deleted` + "\n");
          }
        });
      }
    }
  });
}

cleanTranslationFiles();
