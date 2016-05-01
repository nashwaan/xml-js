var fs = require('fs');
var path = require('path');
var parser = require('../lib');
var assert = require('assert');

var expected = fs.readFileSync(__dirname + '/fixtures/xmlsanitize.xml', {encoding: 'utf8'});
//console.log("expected: " + expected)
var json = parser.toJson(expected, {object: true, space: true});
//console.log('xml => json: \n%j', json);

var xmlres = parser.toXml(json, { sanitize: true });
//console.log(xmlres)
//assert.deepEqual(json.doc.Column.length, 5, 'should have 5 Columns');
assert.strictEqual(expected, xmlres, 'xml strings not equal!')

console.log('xml2json toXml sanitize passed!');
