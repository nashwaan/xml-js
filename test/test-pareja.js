//var convert = require('xml-js');
var convert = require('../lib');
var xml = require('fs').readFileSync('fixtures/pareja.xml', 'utf8');
var result = convert.xml2json(xml, {compact: true, spaces: 4});
console.log(result);