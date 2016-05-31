/*jslint node:true */
var convert = require('..');
var xml = 
'<?xml version="1.0" encoding="utf-8"?>' + '\n' +
'<note importance="high" logged="true">' + '\n' +
'    <title>Happy</title>' + '\n' +
'    <todo>Work</todo>' + '\n' +
'    <todo>Play</todo>' + '\n' +
'</note>';
var result1 = convert.xml2json(xml, {compact: true});
var result2 = convert.xml2json(xml, {compact: false});
console.log(result1, '\n', result2);
