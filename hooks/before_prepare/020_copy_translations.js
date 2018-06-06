#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var root = process.argv[2];

function copyTranslationFiles() {
  process.stdout.write('copyTranslationFiles' + "\n");
  var directory = path.join(root, 'projects', process.env.project);
  fs.readdir(directory, function(err, files) {
    for (var file of files) {
      if (file.endsWith(".json") && file != 'build.json') {
        var source = directory + "/" + file;
        var filename = file.replace(".json", "_.json");
        var destination = path.join(root, 'www', 'assets', 'i18n', filename);
        process.stdout.write(`copyTranslationFiles ${source} to ${destination}` + "\n");
        if (fs.existsSync(source)) {
          fs.createReadStream(source).pipe(
            fs.createWriteStream(destination));
        }
      }
    }
  });
}

if (process.env.project != null) {
  copyTranslationFiles();
}
