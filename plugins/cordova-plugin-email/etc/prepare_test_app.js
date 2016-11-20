#!/usr/bin/env node

// Adds simple release notes to config.json and appends build number
//  e.g. release_notes.js 42 -> uses 42 as build number

var args = process.argv.slice(2),
    fs = require('fs'),
    xml2js = require('xml2js'),
    xmlParser = new xml2js.Parser(),
    builder = new xml2js.Builder(),
    exec = require('child_process').exec;


var configXML = fs.readFileSync(args[0]);
xmlParser.parseString(configXML, function (err, result) {
    var updatedConfigXML = result;
    updatedConfigXML.widget.content = {'$': {src: 'cdvtests/index.html'}};
    var xml = builder.buildObject(updatedConfigXML);
    fs.writeFile(args[0], xml, function (err) {
        if (err) throw err;
    });
});