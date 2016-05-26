/*jslint node:true */
var convert = require('..');
var xml = 
'<?xml version="1.0" encoding="utf-8"?>' + '\n' +
'<note importance="high" logged="true">' + '\n' +
'    <title>Happy</title>' + '\n' +
'    <todo>Work</todo>' + '\n' +
'    <todo>Play</todo>' + '\n' +
'</note>';
var result = convert.xml2json(xml, {compact: true});
console.log(result);
