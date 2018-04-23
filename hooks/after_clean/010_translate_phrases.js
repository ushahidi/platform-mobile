#!/usr/bin/env node

const translate = require('google-translate-api');
var languages = ['ar', 'fr', 'es', 'de', 'pt', 'ru', 'nl', 'sw', 'it', 'sq', 'my', 'ht', 'vi'];
var fs = require('fs');
var root = process.argv[2];
var assets = root + "/src/assets/i18n/";
var input = assets + "en.json";
var english = require(input);

console.log("File Source " + input);
var openFile = function(path) {
  return new Promise((resolve, reject) => {
    fs.open(path, 'rs+', (err, fd) => {
      console.log("File Opened " + path);
      resolve(fd);
    });
  });
};
var startFile = function(path) {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, "{", 'utf8', (res) => {
      console.log("File Started " + path);
      resolve();
    });
  });
};
var closeFile = function(path, fd) {
  return new Promise((resolve, reject) => {
    fs.appendFile(path, "\n}", 'utf8', (res) => {
      if (fd) {
        fs.close(fd, () => {
          console.log("File Closed " + path);
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
        console.log(line);
        resolve(line);
      },
      (error) => {
        console.error(error);
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
